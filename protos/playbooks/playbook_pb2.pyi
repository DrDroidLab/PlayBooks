"""
@generated by mypy-protobuf.  Do not edit manually!
isort:skip_file
"""
import builtins
import collections.abc
import google.protobuf.descriptor
import google.protobuf.internal.containers
import google.protobuf.internal.enum_type_wrapper
import google.protobuf.message
import google.protobuf.struct_pb2
import google.protobuf.wrappers_pb2
import protos.base_pb2
import protos.playbooks.intelligence_layer.interpreter_pb2
import protos.playbooks.playbook_commons_pb2
import protos.playbooks.source_task_definitions.api_task_pb2
import protos.playbooks.source_task_definitions.azure_task_pb2
import protos.playbooks.source_task_definitions.bash_task_pb2
import protos.playbooks.source_task_definitions.cloudwatch_task_pb2
import protos.playbooks.source_task_definitions.datadog_task_pb2
import protos.playbooks.source_task_definitions.documentation_task_pb2
import protos.playbooks.source_task_definitions.eks_task_pb2
import protos.playbooks.source_task_definitions.gke_task_pb2
import protos.playbooks.source_task_definitions.grafana_task_pb2
import protos.playbooks.source_task_definitions.new_relic_task_pb2
import protos.playbooks.source_task_definitions.promql_task_pb2
import protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2
import sys
import typing

if sys.version_info >= (3, 10):
    import typing as typing_extensions
else:
    import typing_extensions

DESCRIPTOR: google.protobuf.descriptor.FileDescriptor

@typing_extensions.final
class PlaybookTask(google.protobuf.message.Message):
    """Playbook Task Protos"""

    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    @typing_extensions.final
    class PlaybookTaskConnectorSource(google.protobuf.message.Message):
        DESCRIPTOR: google.protobuf.descriptor.Descriptor

        ID_FIELD_NUMBER: builtins.int
        SOURCE_FIELD_NUMBER: builtins.int
        NAME_FIELD_NUMBER: builtins.int
        @property
        def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
        source: protos.base_pb2.Source.ValueType
        @property
        def name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
        def __init__(
            self,
            *,
            id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
            source: protos.base_pb2.Source.ValueType = ...,
            name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        ) -> None: ...
        def HasField(self, field_name: typing_extensions.Literal["id", b"id", "name", b"name"]) -> builtins.bool: ...
        def ClearField(self, field_name: typing_extensions.Literal["id", b"id", "name", b"name", "source", b"source"]) -> None: ...

    ID_FIELD_NUMBER: builtins.int
    SOURCE_FIELD_NUMBER: builtins.int
    NAME_FIELD_NUMBER: builtins.int
    DESCRIPTION_FIELD_NUMBER: builtins.int
    NOTES_FIELD_NUMBER: builtins.int
    CREATED_BY_FIELD_NUMBER: builtins.int
    GLOBAL_VARIABLE_SET_FIELD_NUMBER: builtins.int
    INTERPRETER_TYPE_FIELD_NUMBER: builtins.int
    TASK_CONNECTOR_SOURCES_FIELD_NUMBER: builtins.int
    DOCUMENTATION_FIELD_NUMBER: builtins.int
    CLOUDWATCH_FIELD_NUMBER: builtins.int
    GRAFANA_FIELD_NUMBER: builtins.int
    NEW_RELIC_FIELD_NUMBER: builtins.int
    DATADOG_FIELD_NUMBER: builtins.int
    CLICKHOUSE_FIELD_NUMBER: builtins.int
    POSTGRES_FIELD_NUMBER: builtins.int
    EKS_FIELD_NUMBER: builtins.int
    SQL_DATABASE_CONNECTION_FIELD_NUMBER: builtins.int
    API_FIELD_NUMBER: builtins.int
    BASH_FIELD_NUMBER: builtins.int
    GRAFANA_MIMIR_FIELD_NUMBER: builtins.int
    AZURE_FIELD_NUMBER: builtins.int
    GKE_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    source: protos.base_pb2.Source.ValueType
    @property
    def name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def description(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def notes(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def created_by(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def global_variable_set(self) -> google.protobuf.struct_pb2.Struct: ...
    interpreter_type: protos.playbooks.intelligence_layer.interpreter_pb2.InterpreterType.ValueType
    @property
    def task_connector_sources(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___PlaybookTask.PlaybookTaskConnectorSource]: ...
    @property
    def documentation(self) -> protos.playbooks.source_task_definitions.documentation_task_pb2.Documentation: ...
    @property
    def cloudwatch(self) -> protos.playbooks.source_task_definitions.cloudwatch_task_pb2.Cloudwatch: ...
    @property
    def grafana(self) -> protos.playbooks.source_task_definitions.grafana_task_pb2.Grafana: ...
    @property
    def new_relic(self) -> protos.playbooks.source_task_definitions.new_relic_task_pb2.NewRelic: ...
    @property
    def datadog(self) -> protos.playbooks.source_task_definitions.datadog_task_pb2.Datadog: ...
    @property
    def clickhouse(self) -> protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2.SqlDataFetch: ...
    @property
    def postgres(self) -> protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2.SqlDataFetch: ...
    @property
    def eks(self) -> protos.playbooks.source_task_definitions.eks_task_pb2.Eks: ...
    @property
    def sql_database_connection(self) -> protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2.SqlDataFetch: ...
    @property
    def api(self) -> protos.playbooks.source_task_definitions.api_task_pb2.Api: ...
    @property
    def bash(self) -> protos.playbooks.source_task_definitions.bash_task_pb2.Bash: ...
    @property
    def grafana_mimir(self) -> protos.playbooks.source_task_definitions.promql_task_pb2.PromQl: ...
    @property
    def azure(self) -> protos.playbooks.source_task_definitions.azure_task_pb2.Azure: ...
    @property
    def gke(self) -> protos.playbooks.source_task_definitions.gke_task_pb2.Gke: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        source: protos.base_pb2.Source.ValueType = ...,
        name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        description: google.protobuf.wrappers_pb2.StringValue | None = ...,
        notes: google.protobuf.wrappers_pb2.StringValue | None = ...,
        created_by: google.protobuf.wrappers_pb2.StringValue | None = ...,
        global_variable_set: google.protobuf.struct_pb2.Struct | None = ...,
        interpreter_type: protos.playbooks.intelligence_layer.interpreter_pb2.InterpreterType.ValueType = ...,
        task_connector_sources: collections.abc.Iterable[global___PlaybookTask.PlaybookTaskConnectorSource] | None = ...,
        documentation: protos.playbooks.source_task_definitions.documentation_task_pb2.Documentation | None = ...,
        cloudwatch: protos.playbooks.source_task_definitions.cloudwatch_task_pb2.Cloudwatch | None = ...,
        grafana: protos.playbooks.source_task_definitions.grafana_task_pb2.Grafana | None = ...,
        new_relic: protos.playbooks.source_task_definitions.new_relic_task_pb2.NewRelic | None = ...,
        datadog: protos.playbooks.source_task_definitions.datadog_task_pb2.Datadog | None = ...,
        clickhouse: protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2.SqlDataFetch | None = ...,
        postgres: protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2.SqlDataFetch | None = ...,
        eks: protos.playbooks.source_task_definitions.eks_task_pb2.Eks | None = ...,
        sql_database_connection: protos.playbooks.source_task_definitions.sql_data_fetch_task_pb2.SqlDataFetch | None = ...,
        api: protos.playbooks.source_task_definitions.api_task_pb2.Api | None = ...,
        bash: protos.playbooks.source_task_definitions.bash_task_pb2.Bash | None = ...,
        grafana_mimir: protos.playbooks.source_task_definitions.promql_task_pb2.PromQl | None = ...,
        azure: protos.playbooks.source_task_definitions.azure_task_pb2.Azure | None = ...,
        gke: protos.playbooks.source_task_definitions.gke_task_pb2.Gke | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["api", b"api", "azure", b"azure", "bash", b"bash", "clickhouse", b"clickhouse", "cloudwatch", b"cloudwatch", "created_by", b"created_by", "datadog", b"datadog", "description", b"description", "documentation", b"documentation", "eks", b"eks", "gke", b"gke", "global_variable_set", b"global_variable_set", "grafana", b"grafana", "grafana_mimir", b"grafana_mimir", "id", b"id", "name", b"name", "new_relic", b"new_relic", "notes", b"notes", "postgres", b"postgres", "sql_database_connection", b"sql_database_connection", "task", b"task"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["api", b"api", "azure", b"azure", "bash", b"bash", "clickhouse", b"clickhouse", "cloudwatch", b"cloudwatch", "created_by", b"created_by", "datadog", b"datadog", "description", b"description", "documentation", b"documentation", "eks", b"eks", "gke", b"gke", "global_variable_set", b"global_variable_set", "grafana", b"grafana", "grafana_mimir", b"grafana_mimir", "id", b"id", "interpreter_type", b"interpreter_type", "name", b"name", "new_relic", b"new_relic", "notes", b"notes", "postgres", b"postgres", "source", b"source", "sql_database_connection", b"sql_database_connection", "task", b"task", "task_connector_sources", b"task_connector_sources"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["task", b"task"]) -> typing_extensions.Literal["documentation", "cloudwatch", "grafana", "new_relic", "datadog", "clickhouse", "postgres", "eks", "sql_database_connection", "api", "bash", "grafana_mimir", "azure", "gke"] | None: ...

global___PlaybookTask = PlaybookTask

@typing_extensions.final
class PlaybookTaskExecutionLog(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ID_FIELD_NUMBER: builtins.int
    TIMESTAMP_FIELD_NUMBER: builtins.int
    TASK_FIELD_NUMBER: builtins.int
    RESULT_FIELD_NUMBER: builtins.int
    INTERPRETATION_FIELD_NUMBER: builtins.int
    TIME_RANGE_FIELD_NUMBER: builtins.int
    CREATED_BY_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    timestamp: builtins.int
    @property
    def task(self) -> global___PlaybookTask: ...
    @property
    def result(self) -> protos.playbooks.playbook_commons_pb2.PlaybookTaskResult: ...
    @property
    def interpretation(self) -> protos.playbooks.intelligence_layer.interpreter_pb2.Interpretation: ...
    @property
    def time_range(self) -> protos.base_pb2.TimeRange: ...
    @property
    def created_by(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        timestamp: builtins.int = ...,
        task: global___PlaybookTask | None = ...,
        result: protos.playbooks.playbook_commons_pb2.PlaybookTaskResult | None = ...,
        interpretation: protos.playbooks.intelligence_layer.interpreter_pb2.Interpretation | None = ...,
        time_range: protos.base_pb2.TimeRange | None = ...,
        created_by: google.protobuf.wrappers_pb2.StringValue | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["created_by", b"created_by", "id", b"id", "interpretation", b"interpretation", "result", b"result", "task", b"task", "time_range", b"time_range"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["created_by", b"created_by", "id", b"id", "interpretation", b"interpretation", "result", b"result", "task", b"task", "time_range", b"time_range", "timestamp", b"timestamp"]) -> None: ...

global___PlaybookTaskExecutionLog = PlaybookTaskExecutionLog

@typing_extensions.final
class PlaybookStep(google.protobuf.message.Message):
    """Playbook Step Protos"""

    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ID_FIELD_NUMBER: builtins.int
    NAME_FIELD_NUMBER: builtins.int
    DESCRIPTION_FIELD_NUMBER: builtins.int
    NOTES_FIELD_NUMBER: builtins.int
    EXTERNAL_LINKS_FIELD_NUMBER: builtins.int
    INTERPRETER_TYPE_FIELD_NUMBER: builtins.int
    TASKS_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    @property
    def name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def description(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def notes(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def external_links(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[protos.playbooks.playbook_commons_pb2.ExternalLink]: ...
    interpreter_type: protos.playbooks.intelligence_layer.interpreter_pb2.InterpreterType.ValueType
    @property
    def tasks(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___PlaybookTask]: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        description: google.protobuf.wrappers_pb2.StringValue | None = ...,
        notes: google.protobuf.wrappers_pb2.StringValue | None = ...,
        external_links: collections.abc.Iterable[protos.playbooks.playbook_commons_pb2.ExternalLink] | None = ...,
        interpreter_type: protos.playbooks.intelligence_layer.interpreter_pb2.InterpreterType.ValueType = ...,
        tasks: collections.abc.Iterable[global___PlaybookTask] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["description", b"description", "id", b"id", "name", b"name", "notes", b"notes"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["description", b"description", "external_links", b"external_links", "id", b"id", "interpreter_type", b"interpreter_type", "name", b"name", "notes", b"notes", "tasks", b"tasks"]) -> None: ...

global___PlaybookStep = PlaybookStep

@typing_extensions.final
class PlaybookStepExecutionLog(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ID_FIELD_NUMBER: builtins.int
    TIMESTAMP_FIELD_NUMBER: builtins.int
    PLAYBOOK_RUN_ID_FIELD_NUMBER: builtins.int
    STEP_FIELD_NUMBER: builtins.int
    TASK_EXECUTION_LOGS_FIELD_NUMBER: builtins.int
    STEP_INTERPRETATION_FIELD_NUMBER: builtins.int
    TIME_RANGE_FIELD_NUMBER: builtins.int
    CREATED_BY_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    timestamp: builtins.int
    @property
    def playbook_run_id(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def step(self) -> global___PlaybookStep: ...
    @property
    def task_execution_logs(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___PlaybookTaskExecutionLog]: ...
    @property
    def step_interpretation(self) -> protos.playbooks.intelligence_layer.interpreter_pb2.Interpretation: ...
    @property
    def time_range(self) -> protos.base_pb2.TimeRange: ...
    @property
    def created_by(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        timestamp: builtins.int = ...,
        playbook_run_id: google.protobuf.wrappers_pb2.StringValue | None = ...,
        step: global___PlaybookStep | None = ...,
        task_execution_logs: collections.abc.Iterable[global___PlaybookTaskExecutionLog] | None = ...,
        step_interpretation: protos.playbooks.intelligence_layer.interpreter_pb2.Interpretation | None = ...,
        time_range: protos.base_pb2.TimeRange | None = ...,
        created_by: google.protobuf.wrappers_pb2.StringValue | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["created_by", b"created_by", "id", b"id", "playbook_run_id", b"playbook_run_id", "step", b"step", "step_interpretation", b"step_interpretation", "time_range", b"time_range"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["created_by", b"created_by", "id", b"id", "playbook_run_id", b"playbook_run_id", "step", b"step", "step_interpretation", b"step_interpretation", "task_execution_logs", b"task_execution_logs", "time_range", b"time_range", "timestamp", b"timestamp"]) -> None: ...

global___PlaybookStepExecutionLog = PlaybookStepExecutionLog

@typing_extensions.final
class Playbook(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ID_FIELD_NUMBER: builtins.int
    NAME_FIELD_NUMBER: builtins.int
    DESCRIPTION_FIELD_NUMBER: builtins.int
    GLOBAL_VARIABLE_SET_FIELD_NUMBER: builtins.int
    CREATED_BY_FIELD_NUMBER: builtins.int
    IS_ACTIVE_FIELD_NUMBER: builtins.int
    CREATED_AT_FIELD_NUMBER: builtins.int
    LAST_RUN_AT_FIELD_NUMBER: builtins.int
    STATUS_FIELD_NUMBER: builtins.int
    STEPS_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    @property
    def name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def description(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def global_variable_set(self) -> google.protobuf.struct_pb2.Struct: ...
    @property
    def created_by(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def is_active(self) -> google.protobuf.wrappers_pb2.BoolValue: ...
    created_at: builtins.int
    last_run_at: builtins.int
    status: protos.playbooks.playbook_commons_pb2.PlaybookExecutionStatusType.ValueType
    @property
    def steps(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___PlaybookStep]: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        description: google.protobuf.wrappers_pb2.StringValue | None = ...,
        global_variable_set: google.protobuf.struct_pb2.Struct | None = ...,
        created_by: google.protobuf.wrappers_pb2.StringValue | None = ...,
        is_active: google.protobuf.wrappers_pb2.BoolValue | None = ...,
        created_at: builtins.int = ...,
        last_run_at: builtins.int = ...,
        status: protos.playbooks.playbook_commons_pb2.PlaybookExecutionStatusType.ValueType = ...,
        steps: collections.abc.Iterable[global___PlaybookStep] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["created_by", b"created_by", "description", b"description", "global_variable_set", b"global_variable_set", "id", b"id", "is_active", b"is_active", "name", b"name"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["created_at", b"created_at", "created_by", b"created_by", "description", b"description", "global_variable_set", b"global_variable_set", "id", b"id", "is_active", b"is_active", "last_run_at", b"last_run_at", "name", b"name", "status", b"status", "steps", b"steps"]) -> None: ...

global___Playbook = Playbook

@typing_extensions.final
class PlaybookExecution(google.protobuf.message.Message):
    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    ID_FIELD_NUMBER: builtins.int
    PLAYBOOK_RUN_ID_FIELD_NUMBER: builtins.int
    PLAYBOOK_FIELD_NUMBER: builtins.int
    STATUS_FIELD_NUMBER: builtins.int
    CREATED_AT_FIELD_NUMBER: builtins.int
    STARTED_AT_FIELD_NUMBER: builtins.int
    FINISHED_AT_FIELD_NUMBER: builtins.int
    TIME_RANGE_FIELD_NUMBER: builtins.int
    CREATED_BY_FIELD_NUMBER: builtins.int
    STEP_EXECUTION_LOGS_FIELD_NUMBER: builtins.int
    @property
    def id(self) -> google.protobuf.wrappers_pb2.UInt64Value: ...
    @property
    def playbook_run_id(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def playbook(self) -> global___Playbook: ...
    status: protos.playbooks.playbook_commons_pb2.PlaybookExecutionStatusType.ValueType
    created_at: builtins.int
    started_at: builtins.int
    finished_at: builtins.int
    @property
    def time_range(self) -> protos.base_pb2.TimeRange: ...
    @property
    def created_by(self) -> google.protobuf.wrappers_pb2.StringValue: ...
    @property
    def step_execution_logs(self) -> google.protobuf.internal.containers.RepeatedCompositeFieldContainer[global___PlaybookStepExecutionLog]: ...
    def __init__(
        self,
        *,
        id: google.protobuf.wrappers_pb2.UInt64Value | None = ...,
        playbook_run_id: google.protobuf.wrappers_pb2.StringValue | None = ...,
        playbook: global___Playbook | None = ...,
        status: protos.playbooks.playbook_commons_pb2.PlaybookExecutionStatusType.ValueType = ...,
        created_at: builtins.int = ...,
        started_at: builtins.int = ...,
        finished_at: builtins.int = ...,
        time_range: protos.base_pb2.TimeRange | None = ...,
        created_by: google.protobuf.wrappers_pb2.StringValue | None = ...,
        step_execution_logs: collections.abc.Iterable[global___PlaybookStepExecutionLog] | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["created_by", b"created_by", "id", b"id", "playbook", b"playbook", "playbook_run_id", b"playbook_run_id", "time_range", b"time_range"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["created_at", b"created_at", "created_by", b"created_by", "finished_at", b"finished_at", "id", b"id", "playbook", b"playbook", "playbook_run_id", b"playbook_run_id", "started_at", b"started_at", "status", b"status", "step_execution_logs", b"step_execution_logs", "time_range", b"time_range"]) -> None: ...

global___PlaybookExecution = PlaybookExecution

@typing_extensions.final
class UpdatePlaybookOp(google.protobuf.message.Message):
    """Crud Protos"""

    DESCRIPTOR: google.protobuf.descriptor.Descriptor

    class _Op:
        ValueType = typing.NewType("ValueType", builtins.int)
        V: typing_extensions.TypeAlias = ValueType

    class _OpEnumTypeWrapper(google.protobuf.internal.enum_type_wrapper._EnumTypeWrapper[UpdatePlaybookOp._Op.ValueType], builtins.type):  # noqa: F821
        DESCRIPTOR: google.protobuf.descriptor.EnumDescriptor
        UNKNOWN: UpdatePlaybookOp._Op.ValueType  # 0
        UPDATE_PLAYBOOK_NAME: UpdatePlaybookOp._Op.ValueType  # 1
        UPDATE_PLAYBOOK_STATUS: UpdatePlaybookOp._Op.ValueType  # 2
        UPDATE_PLAYBOOK: UpdatePlaybookOp._Op.ValueType  # 3

    class Op(_Op, metaclass=_OpEnumTypeWrapper): ...
    UNKNOWN: UpdatePlaybookOp.Op.ValueType  # 0
    UPDATE_PLAYBOOK_NAME: UpdatePlaybookOp.Op.ValueType  # 1
    UPDATE_PLAYBOOK_STATUS: UpdatePlaybookOp.Op.ValueType  # 2
    UPDATE_PLAYBOOK: UpdatePlaybookOp.Op.ValueType  # 3

    @typing_extensions.final
    class UpdatePlaybookName(google.protobuf.message.Message):
        DESCRIPTOR: google.protobuf.descriptor.Descriptor

        NAME_FIELD_NUMBER: builtins.int
        @property
        def name(self) -> google.protobuf.wrappers_pb2.StringValue: ...
        def __init__(
            self,
            *,
            name: google.protobuf.wrappers_pb2.StringValue | None = ...,
        ) -> None: ...
        def HasField(self, field_name: typing_extensions.Literal["name", b"name"]) -> builtins.bool: ...
        def ClearField(self, field_name: typing_extensions.Literal["name", b"name"]) -> None: ...

    @typing_extensions.final
    class UpdatePlaybookStatus(google.protobuf.message.Message):
        DESCRIPTOR: google.protobuf.descriptor.Descriptor

        IS_ACTIVE_FIELD_NUMBER: builtins.int
        @property
        def is_active(self) -> google.protobuf.wrappers_pb2.BoolValue: ...
        def __init__(
            self,
            *,
            is_active: google.protobuf.wrappers_pb2.BoolValue | None = ...,
        ) -> None: ...
        def HasField(self, field_name: typing_extensions.Literal["is_active", b"is_active"]) -> builtins.bool: ...
        def ClearField(self, field_name: typing_extensions.Literal["is_active", b"is_active"]) -> None: ...

    @typing_extensions.final
    class UpdatePlaybook(google.protobuf.message.Message):
        DESCRIPTOR: google.protobuf.descriptor.Descriptor

        PLAYBOOK_FIELD_NUMBER: builtins.int
        @property
        def playbook(self) -> global___Playbook: ...
        def __init__(
            self,
            *,
            playbook: global___Playbook | None = ...,
        ) -> None: ...
        def HasField(self, field_name: typing_extensions.Literal["playbook", b"playbook"]) -> builtins.bool: ...
        def ClearField(self, field_name: typing_extensions.Literal["playbook", b"playbook"]) -> None: ...

    OP_FIELD_NUMBER: builtins.int
    UPDATE_PLAYBOOK_NAME_FIELD_NUMBER: builtins.int
    UPDATE_PLAYBOOK_STATUS_FIELD_NUMBER: builtins.int
    UPDATE_PLAYBOOK_FIELD_NUMBER: builtins.int
    op: global___UpdatePlaybookOp.Op.ValueType
    @property
    def update_playbook_name(self) -> global___UpdatePlaybookOp.UpdatePlaybookName: ...
    @property
    def update_playbook_status(self) -> global___UpdatePlaybookOp.UpdatePlaybookStatus: ...
    @property
    def update_playbook(self) -> global___UpdatePlaybookOp.UpdatePlaybook: ...
    def __init__(
        self,
        *,
        op: global___UpdatePlaybookOp.Op.ValueType = ...,
        update_playbook_name: global___UpdatePlaybookOp.UpdatePlaybookName | None = ...,
        update_playbook_status: global___UpdatePlaybookOp.UpdatePlaybookStatus | None = ...,
        update_playbook: global___UpdatePlaybookOp.UpdatePlaybook | None = ...,
    ) -> None: ...
    def HasField(self, field_name: typing_extensions.Literal["update", b"update", "update_playbook", b"update_playbook", "update_playbook_name", b"update_playbook_name", "update_playbook_status", b"update_playbook_status"]) -> builtins.bool: ...
    def ClearField(self, field_name: typing_extensions.Literal["op", b"op", "update", b"update", "update_playbook", b"update_playbook", "update_playbook_name", b"update_playbook_name", "update_playbook_status", b"update_playbook_status"]) -> None: ...
    def WhichOneof(self, oneof_group: typing_extensions.Literal["update", b"update"]) -> typing_extensions.Literal["update_playbook_name", "update_playbook_status", "update_playbook"] | None: ...

global___UpdatePlaybookOp = UpdatePlaybookOp
