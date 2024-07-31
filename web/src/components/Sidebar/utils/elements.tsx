import {
  CollectionsBookmarkRounded,
  DataThresholdingRounded,
  LayersRounded,
  SlowMotionVideoRounded,
  TerminalRounded,
  TipsAndUpdatesRounded,
} from "@mui/icons-material";
import { routes } from "../../../routes";

export const elements = [
  {
    to: routes.HOME,
    label: "Playbooks",
    icon: <CollectionsBookmarkRounded />,
  },
  {
    to: routes.WORKFLOWS,
    label: "Workflows",
    icon: <LayersRounded />,
  },
  {
    to: routes.WORKFLOW_EXECUTIONS_LIST,
    label: "Workflow Executions",
    icon: <SlowMotionVideoRounded />,
  },
  {
    to: routes.PLAYBOOK_EXECUTIONS_LIST,
    label: "Playbook Executions",
    icon: <SlowMotionVideoRounded />,
  },
  {
    to: routes.PLAYGROUND,
    label: "Sample Playbooks",
    icon: <TerminalRounded />,
  },
  {
    to: routes.DATA_SOURCES,
    label: "Integrations",
    icon: <DataThresholdingRounded />,
  },
  {
    to: routes.DYNAMIC_ALERTS,
    label: "Dynamic Alerts",
    icon: <TipsAndUpdatesRounded />,
  },
];
