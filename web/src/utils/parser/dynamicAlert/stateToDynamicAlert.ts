import { store } from "../../../store";
import { dynamicAlertSelector } from "../../../store/features/dynamicAlerts/selectors";
import { DynamicAlertType } from "../../../types";
import { TimezoneTypes } from "../../workflow/types";
import stateToPlaybook from "../playbook/stateToPlaybook";

export const stateToDynamicAlert = () => {
  const dynamicAlert: DynamicAlertType = dynamicAlertSelector(store.getState());

  return {
    id: dynamicAlert.id,
    name: dynamicAlert.name,
    type: "DYNAMIC_ALERT",
    schedule: {
      type: "CRON",
      cron: {
        keep_alive: true,
        rule: "* * * 5 *",
        timezone: TimezoneTypes.UTC,
      },
    },
    playbooks: [
      { ...stateToPlaybook(), name: `${dynamicAlert.name}_playbook` },
    ],
    entry_points: [
      {
        type: "API",
        api: {},
      },
    ],
    actions: [],
    configuration: {},
  };
};
