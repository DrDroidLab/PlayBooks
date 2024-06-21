from typing import Dict

from protos.playbooks.playbook_pb2 import PlaybookStep, PlaybookStepRelation


def travel_child_steps(parent_step_id, first_order_relations):
    if parent_step_id not in first_order_relations:
        return []
    children = first_order_relations[parent_step_id]
    all_child_steps = []
    for child_step in children:
        all_child_steps.append({child_step: travel_child_steps(child_step, first_order_relations)})
    return all_child_steps


def generate_graph_view(first_order_relations) -> Dict:
    graph_view = {}
    for parent_step_id in first_order_relations:
        graph_view[parent_step_id] = travel_child_steps(parent_step_id, first_order_relations)
    for parent, children in first_order_relations.items():
        for child in children:
            if child in graph_view:
                graph_view.pop(child, None)
    return graph_view


def get_playbook_steps_graph_view(all_step_relations: [PlaybookStepRelation]) -> Dict:
    first_order_relations = {}
    for sr in all_step_relations:
        if sr.parent.id.value not in first_order_relations:
            first_order_relations[sr.parent.id.value] = []
        first_order_relations[sr.parent.id.value].append(sr.child.id.value)

    graph_view = generate_graph_view(first_order_relations)
    return graph_view


def get_playbook_steps_id_def_map(all_steps: [PlaybookStep]) -> Dict:
    step_id_def_map = {}
    for step in all_steps:
        step_id_def_map[step.id.value] = step
    return step_id_def_map
