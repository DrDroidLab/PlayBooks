import json
import logging

from celery import shared_task
from google.protobuf.struct_pb2 import Struct
from google.protobuf.wrappers_pb2 import StringValue, BoolValue

from accounts.models import Account
from executor.crud.playbook_execution_crud import get_db_playbook_execution, update_db_playbook_execution_status, \
    update_db_account_playbook_execution_status, bulk_create_playbook_execution_log, \
    update_db_account_playbook_execution_global_variable_set
from executor.crud.playbooks_crud import get_db_playbooks
from executor.models import PlayBook, PlayBookExecution
from executor.playbook_source_facade import playbook_source_facade
from executor.playbook_result_conditional_evaluators.step_condition_evaluator import step_condition_evaluator
from executor.utils.playbook_step_utils import get_playbook_steps_graph_view, get_playbook_steps_id_def_map
from intelligence_layer.result_interpreters.result_interpreter_facade import task_result_interpret, \
    step_result_interpret
from intelligence_layer.result_interpreters.step_relation_interpreters.step_relation_interpreter import \
    step_relation_interpret
from management.utils.celery_task_signal_utils import publish_pre_run_task, publish_task_failure, publish_post_run_task
from protos.base_pb2 import TimeRange
from protos.playbooks.intelligence_layer.interpreter_pb2 import Interpretation as InterpretationProto, InterpreterType
from protos.playbooks.playbook_commons_pb2 import PlaybookExecutionStatusType, PlaybookTaskResult
from protos.playbooks.playbook_pb2 import Playbook as PlaybookProto, PlaybookTaskExecutionLog, PlaybookStepExecutionLog, \
    PlaybookStep as PlaybookStepProto, PlaybookStepResultCondition, PlaybookStepRelationExecutionLog, \
    PlaybookExecution as PlaybookExecutionProto
from utils.proto_utils import dict_to_proto, proto_to_dict

logger = logging.getLogger(__name__)


def store_step_execution_logs(account: Account, db_playbook: PlayBook, db_pb_execution: PlayBookExecution,
                              step_execution_logs: [PlaybookStepExecutionLog], user=None, tr=None):
    try:
        all_step_executions = {}
        for sel in step_execution_logs:
            all_task_executions = []
            all_step_relation_executions = []
            logger.info(f"Step Execution Log: {sel}")
            for tel in sel.task_execution_logs:
                logger.info(f"Task Execution Log: {tel}")
                all_task_executions.append({
                    'task_id': tel.task.id.value,
                    'task_result': proto_to_dict(tel.result),
                    'task_interpretation': proto_to_dict(tel.interpretation),
                    'execution_global_variable_set': proto_to_dict(
                        tel.execution_global_variable_set) if tel.execution_global_variable_set else None,
                })
            for srel in sel.relation_execution_logs:
                logger.info(f"Relation Execution Log: {srel}")
                all_step_relation_executions.append({
                    'relation_id': srel.relation.id.value,
                    'evaluation_result': srel.evaluation_result.value,
                    'evaluation_output': proto_to_dict(srel.evaluation_output) if srel.evaluation_output else None,
                    'step_relation_interpretation': proto_to_dict(
                        srel.step_relation_interpretation) if srel.step_relation_interpretation else None
                })
            all_step_executions[sel.step.id.value] = {
                'all_task_executions': all_task_executions,
                'all_step_relation_executions': all_step_relation_executions,
                'step_interpretation': proto_to_dict(sel.step_interpretation)
            }
        bulk_create_playbook_execution_log(account, db_playbook, db_pb_execution, all_step_executions, user=user, tr=tr)
    except Exception as exc:
        logger.error(f"Error occurred while storing step execution logs: {exc}")
        raise exc


def execute_playbook_step_impl(tr: TimeRange, account: Account, step: PlaybookStepProto, global_variable_set=None):
    try:
        tasks = step.tasks
        children = step.children
        interpreter_type: InterpreterType = step.interpreter_type if step.interpreter_type else InterpreterType.BASIC_I
        pte_logs = []
        task_interpretations = []
        execution_global_variable_set = Struct()
        if global_variable_set and global_variable_set.items():
            execution_global_variable_set.CopyFrom(global_variable_set)

        task_execution_global_variable_set = Struct()
        if global_variable_set and global_variable_set.items():
            task_execution_global_variable_set.CopyFrom(global_variable_set)
        for task_proto in tasks:
            if not execution_global_variable_set or not execution_global_variable_set.items():
                if task_proto.global_variable_set and task_proto.global_variable_set.items():
                    execution_global_variable_set = task_proto.global_variable_set

            is_bulk_execution = False
            bulk_execution_var_values = ['Single Execution']
            bulk_task_var = None
            if task_proto.execution_configuration.is_bulk_execution and task_proto.execution_configuration.is_bulk_execution.value:
                is_bulk_execution = True
                bulk_task_var = task_proto.execution_configuration.bulk_execution_var_field.value if task_proto.execution_configuration.HasField(
                    'bulk_execution_var_field') else None
                if not bulk_task_var:
                    task_result = PlaybookTaskResult(error=StringValue(value="Bulk execution variable not found"))
                    pte_logs.append(PlaybookTaskExecutionLog(task=task_proto,
                                                             result=task_result,
                                                             execution_global_variable_set=execution_global_variable_set))
                    continue

                if bulk_task_var not in execution_global_variable_set:
                    task_result = PlaybookTaskResult(
                        error=StringValue(value="Bulk execution variable not found in global variables"))
                    pte_logs.append(PlaybookTaskExecutionLog(task=task_proto,
                                                             result=task_result,
                                                             execution_global_variable_set=execution_global_variable_set))
                    continue

                bulk_value = execution_global_variable_set[bulk_task_var]
                try:
                    parsed = json.loads(bulk_value)
                    if isinstance(parsed, list):
                        bulk_execution_var_values = parsed
                    else:
                        bulk_execution_var_values = bulk_value.split(',')
                except Exception:
                    bulk_execution_var_values = bulk_value.split(',')

                if not bulk_execution_var_values:
                    task_result = PlaybookTaskResult(
                        error=StringValue(value="Bulk execution variable values not found in global variables"))
                    pte_logs.append(PlaybookTaskExecutionLog(task=task_proto,
                                                             result=task_result,
                                                             execution_global_variable_set=global_variable_set))
                    continue
            for bev in bulk_execution_var_values:
                if is_bulk_execution and bulk_task_var:
                    task_execution_global_variable_set[bulk_task_var] = bev
                try:
                    task_result = playbook_source_facade.execute_task(account.id, tr, task_execution_global_variable_set,
                                                                      task_proto)
                    task_interpretation: InterpretationProto = task_result_interpret(interpreter_type, task_proto,
                                                                                     task_result)
                    task_interpretations.append(task_interpretation)

                    if task_result.result_transformer_lambda_function_variable_set and task_result.result_transformer_lambda_function_variable_set.items():
                        execution_global_variable_set.update(
                            task_result.result_transformer_lambda_function_variable_set)

                    playbook_task_execution_log = PlaybookTaskExecutionLog(task=task_proto, result=task_result,
                                                                           interpretation=task_interpretation,
                                                                           execution_global_variable_set=execution_global_variable_set)
                except Exception as exc:
                    logger.error(f"Error occurred while running task: {exc}")
                    playbook_task_execution_log = PlaybookTaskExecutionLog(task=task_proto,
                                                                           result=PlaybookTaskResult(
                                                                               error=StringValue(value=str(exc))),
                                                                           execution_global_variable_set=execution_global_variable_set)
                pte_logs.append(playbook_task_execution_log)
        step_interpretation: InterpretationProto = step_result_interpret(interpreter_type, step, task_interpretations)

        relation_execution_logs = []
        for relation_proto in children:
            condition: PlaybookStepResultCondition = relation_proto.condition
            try:
                condition_evaluation_result, condition_evaluation_output = step_condition_evaluator.evaluate(condition,
                                                                                                             pte_logs)
            except Exception as exc:
                logger.error(f"Error occurred while evaluating condition: {exc}")
                condition_evaluation_result = False
                condition_evaluation_output = {'error': str(exc) if exc else 'Unknown Error'}
            condition_evaluation_output_proto = dict_to_proto(condition_evaluation_output, Struct)
            if condition_evaluation_output == {}:
                relation_execution_log = PlaybookStepRelationExecutionLog(relation=relation_proto,
                                                                          evaluation_result=BoolValue(
                                                                              value=condition_evaluation_result),
                                                                          evaluation_output=condition_evaluation_output_proto)
            else:
                step_relation_interpretation_string = step_relation_interpret(relation_proto)
                # if condition_evaluation_result:
                #     summary = f"The condition {step_relation_interpretation_string} is True"
                # else:
                #     summary = f"The condition {step_relation_interpretation_string} is False"
                step_relation_interpretation: InterpretationProto = InterpretationProto(
                    type=InterpretationProto.Type.TEXT,
                    summary=StringValue(value=step_relation_interpretation_string),
                    model_type=InterpretationProto.ModelType.PLAYBOOK_STEP_RELATION
                )
                relation_execution_log = PlaybookStepRelationExecutionLog(relation=relation_proto,
                                                                          evaluation_result=BoolValue(
                                                                              value=condition_evaluation_result),
                                                                          evaluation_output=condition_evaluation_output_proto,
                                                                          step_relation_interpretation=step_relation_interpretation)
            relation_execution_logs.append(relation_execution_log)
        step_execution_log = PlaybookStepExecutionLog(step=step, task_execution_logs=pte_logs,
                                                      step_interpretation=step_interpretation,
                                                      relation_execution_logs=relation_execution_logs)

        return step_execution_log, execution_global_variable_set
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        raise exc


def execute_playbook_step_with_children_impl(tr: TimeRange, account: Account, step_id_def_map, parent_step_id,
                                             global_variable_set=None):
    all_step_executions = []
    parent_step_def = step_id_def_map.get(parent_step_id, None)
    if not parent_step_def:
        raise ValueError(f"Step with id {parent_step_id} not found")
    step_execution_log, global_variable_set = execute_playbook_step_impl(tr, account, parent_step_def,
                                                                         global_variable_set)
    all_step_executions.append(step_execution_log)
    relation_execution_logs: [PlaybookStepRelationExecutionLog] = step_execution_log.relation_execution_logs
    for rel in relation_execution_logs:
        if rel.evaluation_result.value:
            child_step_id = rel.relation.child.id.value
            sub_executions, global_variable_set = execute_playbook_step_with_children_impl(tr, account, step_id_def_map,
                                                                                           child_step_id,
                                                                                           global_variable_set)
            all_step_executions.extend(sub_executions)

    return all_step_executions, global_variable_set


def execute_playbook_impl(tr: TimeRange, account: Account, playbook: PlaybookProto, global_variable_set=None):
    try:
        if not global_variable_set or not global_variable_set.items():
            if playbook.global_variable_set and playbook.global_variable_set.items():
                global_variable_set = playbook.global_variable_set
        step_execution_logs = []
        step_id_def_map = get_playbook_steps_id_def_map(playbook.steps)
        if playbook.step_relations:
            graph_view = get_playbook_steps_graph_view(playbook.step_relations)
        else:
            graph_view = {step_id: [] for step_id in step_id_def_map}

        for step_id in graph_view:
            logs, global_variable_set = execute_playbook_step_with_children_impl(tr, account, step_id_def_map, step_id,
                                                                                 global_variable_set)
            step_execution_logs.extend(logs)
        return step_execution_logs, global_variable_set
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        raise exc


@shared_task(max_retries=3, default_retry_delay=10)
def execute_playbook(account_id, playbook_id, playbook_execution_id, time_range):
    logger.info(f"Running playbook:: account_id: {account_id}, playbook_id: {playbook_id}, "
                f"playbook_execution_id: {playbook_execution_id} time_range: {time_range}")
    try:
        account = Account.objects.get(id=account_id)
        pb = get_db_playbooks(account, playbook_id=playbook_id, is_active=True)
        pb_execution = get_db_playbook_execution(account, playbook_execution_id=playbook_execution_id)
        if not pb or not pb_execution:
            raise Exception("Playbook or Playbook Execution not found")
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        run_updated = update_db_playbook_execution_status(playbook_execution_id, PlaybookExecutionStatusType.FAILED)
        if not run_updated:
            logger.error(f"Failed to update playbook run status to FAILED for "
                         f"playbook_execution_id: {playbook_execution_id}")
        return False

    update_db_account_playbook_execution_status(account, playbook_execution_id, PlaybookExecutionStatusType.RUNNING)
    pb = pb.first()
    pb_proto = pb.proto

    pb_execution = pb_execution.first()
    pb_execution_proto: PlaybookExecutionProto = pb_execution.proto_partial
    if pb_execution_proto.time_range:
        tr: TimeRange = pb_execution_proto.time_range
    else:
        tr: TimeRange = dict_to_proto(time_range, TimeRange)

    try:
        execution_global_variable_set = Struct()
        execution_global_variable_set.update(pb_proto.global_variable_set)
        execution_global_variable_set.update(pb_execution_proto.execution_global_variable_set)

        execution_global_variable_set_dict = {}
        if execution_global_variable_set and execution_global_variable_set.items():
            execution_global_variable_set_dict = proto_to_dict(execution_global_variable_set)

        update_db_account_playbook_execution_global_variable_set(account, playbook_execution_id,
                                                                 execution_global_variable_set_dict)

        step_execution_logs, execution_global_variable_set = execute_playbook_impl(tr, account, pb_proto,
                                                                                   execution_global_variable_set)

        if execution_global_variable_set and execution_global_variable_set.items():
            execution_global_variable_set_dict = proto_to_dict(execution_global_variable_set)

        store_step_execution_logs(account, pb, pb_execution, step_execution_logs)

        update_db_account_playbook_execution_global_variable_set(account, playbook_execution_id,
                                                                 execution_global_variable_set_dict)
        update_db_account_playbook_execution_status(account, playbook_execution_id,
                                                    PlaybookExecutionStatusType.FINISHED)
    except Exception as exc:
        logger.error(f"Error occurred while running playbook: {exc}")
        update_db_account_playbook_execution_status(account, playbook_execution_id, PlaybookExecutionStatusType.FAILED)


execute_playbook_prerun_notifier = publish_pre_run_task(execute_playbook)
execute_playbook_failure_notifier = publish_task_failure(execute_playbook)
execute_playbook_postrun_notifier = publish_post_run_task(execute_playbook)
