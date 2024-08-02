import { store } from "../../../store";
import { dynamicAlertSelector } from "../../../store/features/dynamicAlerts/selectors";
import { currentPlaybookSelector } from "../../../store/features/playbook/selectors";
import { Playbook } from "../../../types";
import { DynamicAlertType } from "../../../types";

export const stateToDynamicAlert = () => {
  const dynamicAlert: DynamicAlertType = dynamicAlertSelector(store.getState());
  const playbook: Playbook | undefined = currentPlaybookSelector(
    store.getState(),
  );

  return {
    name: dynamicAlert.name,
    type: "DYNAMIC_ALERT",
    schedule: {
      type: "ONE_OFF",
      one_off: {},
    },
    playbooks: [playbook],
    entry_points: [],
    actions: [],
    configuration: {},
  };
};
