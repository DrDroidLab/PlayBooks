/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import Heading from "../../components/Heading.js";
import BasicDetails from "../../components/Workflows/create/BasicDetails.js";
import ScheduleDetails from "../../components/Workflows/create/ScheduleDetails.js";
import NotificationDetails from "../../components/Workflows/create/NotificationDetails.js";
import { useCreateWorkflowMutation } from "../../store/features/workflow/api/index.ts";
import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  currentWorkflowSelector,
  resetWorkflowState,
} from "../../store/features/workflow/workflowSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../store/features/snackbar/snackbarSlice.ts";
import { useLazyGetWorkflowQuery } from "../../store/features/workflow/api/getWorkflowApi.ts";
import Loading from "../../components/common/Loading/index.tsx";
import { useUpdateWorkflowMutation } from "../../store/features/workflow/api/updateWorkflowApi.ts";
import { useLazyTestWorkflowNotificationQuery } from "../../store/features/workflow/api/testWorkflowNotificationApi.ts";
import { stateToWorkflow } from "../../utils/parser/workflow/stateToWorkflow.ts";
import { validate } from "../../components/Workflows/create/utils/validation.ts";
import CustomButton from "../../components/common/CustomButton/index.tsx";
import { testRunAvailableNotificationTypes } from "../../utils/workflow/testRunAvailableNotificationTypes.ts";

function CreateWorkflow() {
  const { id: workflowId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [triggerSave, { isLoading }] = useCreateWorkflowMutation();
  const [triggerUpdate, { isLoading: updateLoading }] =
    useUpdateWorkflowMutation();
  const [triggerGetWorkflow, { isLoading: workflowLoading }] =
    useLazyGetWorkflowQuery();
  const [triggerTestWorkflowNotification] =
    useLazyTestWorkflowNotificationQuery();
  const currentWorkflow = useSelector(currentWorkflowSelector);

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const workflow = {
        ...stateToWorkflow().workflow,
        id: workflowId,
      };
      let response: any = {};
      if (workflowId) {
        response = await triggerUpdate(workflow).unwrap();
      } else {
        response = await triggerSave().unwrap();
      }
      if (response.success) {
        navigate("/workflows");
      }
    } catch (e: any) {
      dispatch(showSnackbar(e?.message?.toString() ?? e.toString()));
    }
  };

  const handleTestNotification = () => {
    triggerTestWorkflowNotification();
    dispatch(showSnackbar("Test Notification Sent"));
  };

  useEffect(() => {
    return () => {
      dispatch(resetWorkflowState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (workflowId != null) {
      triggerGetWorkflow(workflowId);
    }
  }, [workflowId]);

  if (workflowLoading) {
    return <Loading title="Your workflow is loading..." />;
  }

  return (
    <div>
      <Heading
        heading={
          workflowId
            ? "Editing Workflow- " + currentWorkflow.name
            : "Create Workflow"
        }
      />
      <div className="p-6 flex flex-col gap-3 bg-white border rounded m-2">
        <BasicDetails />
        <hr />
        <ScheduleDetails />
        <hr />
        <NotificationDetails />
        <div className="flex items-center gap-2">
          <CustomButton onClick={handleSave}>
            {workflowId ? "Update" : "Save"}
          </CustomButton>
          {testRunAvailableNotificationTypes.includes(
            currentWorkflow.notification,
          ) && (
            <CustomButton onClick={handleTestNotification}>
              Test Run
            </CustomButton>
          )}
          {(isLoading || updateLoading) && <CircularProgress size={20} />}
        </div>
      </div>
    </div>
  );
}

export default CreateWorkflow;
