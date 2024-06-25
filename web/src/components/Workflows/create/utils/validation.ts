import { store } from "../../../../store/index.ts";
import { showSnackbar } from "../../../../store/features/snackbar/snackbarSlice.ts";
import {
  removeErrorKey,
  setErrorKey,
} from "../../../../store/features/workflow/workflowSlice.ts";

export const validate = () => {
  const currentWorkflow = store.getState().workflows.currentWorkflow;
  const dispatch = store.dispatch;
  let error = "";
  if (!currentWorkflow.name) {
    error = "Please enter a name";
    dispatch(showSnackbar("Workflow name is required"));
    dispatch(setErrorKey({ key: "name", value: "Please enter a name" }));
  } else {
    dispatch(removeErrorKey("name"));
  }
  if (!(currentWorkflow as any).playbookId) {
    error = "Please select a playbook";
    dispatch(showSnackbar("Playbook is required"));
    dispatch(
      setErrorKey({ key: "playbookId", value: "Please select a playbook" }),
    );
  } else {
    dispatch(removeErrorKey("playbookId"));
  }
  if (!currentWorkflow.workflowType) {
    error = "Please select a type";
    dispatch(showSnackbar("Workflow type is required"));
    dispatch(
      setErrorKey({ key: "workflowType", value: "Please select a type" }),
    );
  } else {
    dispatch(removeErrorKey("workflowType"));
  }
  if (currentWorkflow.workflowType === "slack") {
    if (!(currentWorkflow.trigger as any)?.channel?.channel_id) {
      error = "Please select a channel";
      dispatch(showSnackbar("Channel ID is required"));
      dispatch(
        setErrorKey({ key: "channelId", value: "Please select a channel" }),
      );
    } else {
      dispatch(removeErrorKey("channelId"));
    }
    if (!(currentWorkflow.trigger as any)?.source) {
      error = "Please select a trigger";
      dispatch(showSnackbar("A source is required"));
      dispatch(
        setErrorKey({ key: "source", value: "Please select a trigger" }),
      );
    } else {
      dispatch(removeErrorKey("source"));
    }
    // if (!(currentWorkflow.trigger as any)?.filterString) {
    //   error = "Please enter a matching string";
    //   dispatch(showSnackbar("A matching string is required"));
    //   dispatch(
    //     setErrorKey({
    //       key: "filterString",
    //       value: "Please enter a matching string",
    //     }),
    //   );
    // } else {
    //   dispatch(removeErrorKey("filterString"));
    // }
  }

  if (currentWorkflow.schedule === "periodic") {
    if (!(currentWorkflow as any)?.duration) {
      error = "Please enter a duration";
      dispatch(showSnackbar("A duration is required"));
      dispatch(
        setErrorKey({ key: "duration", value: "Please enter an duration" }),
      );
    } else {
      dispatch(removeErrorKey("duration"));
    }
  }

  if ((currentWorkflow as any).notification === "slack-message") {
    if (!(currentWorkflow as any).channel) {
      error = "Please select a channel";
      dispatch(showSnackbar("Channel is required"));
      dispatch(
        setErrorKey({ key: "channel", value: "Please select a channel" }),
      );
    } else {
      dispatch(removeErrorKey("channel"));
    }
  }
  
  if (error) {
    return false;
  } else {
    return true;
  }
};
