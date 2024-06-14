import { Save } from "@mui/icons-material";
import React, { useState } from "react";
import SavePlaybookOverlay from "../SavePlaybookOverlay";
import {
  useCreatePlaybookMutation,
  useUpdatePlaybookMutation,
} from "../../../store/features/playbook/api/index.ts";
import { stepsToPlaybook } from "../../../utils/parser/playbook/stepsToplaybook.ts";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  stepsSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice.ts";
import CustomButton from "../../common/CustomButton/index.tsx";

function StepActions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const steps = useSelector(stepsSelector);
  const currentPlaybook = useSelector(playbookSelector);
  const { isEditing } = useSelector(playbookSelector);
  const [isSavePlaybookOverlayOpen, setIsSavePlaybookOverlayOpen] =
    useState(false);
  const [triggerUpdatePlaybook, { isLoading: updateLoading }] =
    useUpdatePlaybookMutation();
  const [triggerCreatePlaybook, { isLoading: createLoading }] =
    useCreatePlaybookMutation();

  const handlePlaybookSave = async ({ pbName, description }) => {
    setIsSavePlaybookOverlayOpen(false);

    const playbook = stepsToPlaybook(currentPlaybook, steps);
    if (steps?.length === 0) {
      dispatch(showSnackbar("You cannot save a playbook with no steps"));
      return;
    }

    const playbookObj = {
      playbook: {
        ...playbook,
        name: pbName,
        description,
      },
    };

    try {
      const response = await triggerCreatePlaybook(playbookObj).unwrap();
      navigate(`/playbooks/${response.playbook?.id}`, { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaybookUpdate = async () => {
    setIsSavePlaybookOverlayOpen(false);
    const playbook = stepsToPlaybook(currentPlaybook, steps);
    if (steps?.length === 0) {
      dispatch(showSnackbar("You cannot save a playbook with no steps"));
      return;
    }
    try {
      await triggerUpdatePlaybook({
        ...playbook,
        id: currentPlaybook.id,
      }).unwrap();
      navigate(`/playbooks`);
    } catch (e) {
      console.log(e);
    }
  };

  const handleSave = () => {
    setIsSavePlaybookOverlayOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      <CustomButton onClick={handleSave}>
        <Save />
        <span>{isEditing ? "Update" : "Save"}</span>
      </CustomButton>
      {(updateLoading || createLoading) && (
        <CircularProgress
          style={{
            textAlign: "center",
          }}
          size={20}
        />
      )}

      <SavePlaybookOverlay
        isOpen={isSavePlaybookOverlayOpen}
        close={() => setIsSavePlaybookOverlayOpen(false)}
        saveCallback={isEditing ? handlePlaybookUpdate : handlePlaybookSave}
      />
    </div>
  );
}

export default StepActions;
