import React, { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { SaveRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import {
  useCreatePlaybookMutation,
  useUpdatePlaybookMutation,
} from "../../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import SavePlaybookOverlay from "../../Playbooks/SavePlaybookOverlay.jsx";
import { stepsToPlaybook } from "../../../utils/parser/playbook/stepsToplaybook.ts";
import { useNavigate } from "react-router-dom";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";

type SavePlaybookButtonPropTypes = {
  shouldNavigate?: boolean;
};

function SavePlaybookButton({
  shouldNavigate = true,
}: SavePlaybookButtonPropTypes) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { closeDrawer } = usePermanentDrawerState();
  const { isEditing, steps } = useSelector(playbookSelector);
  const currentPlaybook = useSelector(playbookSelector);
  const [isSavePlaybookOverlayOpen, setIsSavePlaybookOverlayOpen] =
    useState(false);

  const [triggerUpdatePlaybook, { isLoading: updateLoading }] =
    useUpdatePlaybookMutation();
  const [triggerCreatePlaybook, { isLoading: createLoading }] =
    useCreatePlaybookMutation();

  const isLoading = updateLoading || createLoading;

  const openOverlay = () => {
    setIsSavePlaybookOverlayOpen(true);
  };

  const closeOverlay = () => {
    setIsSavePlaybookOverlayOpen(false);
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
      if (shouldNavigate) {
        navigate(`/playbooks`);
      }
    } catch (e) {
      console.log(e);
    }
  };

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
      // if (shouldNavigate) {
      navigate(`/playbooks/${response.playbook?.id}`, { replace: true });
      // }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCallback = (args: any) => {
    if (isEditing) {
      handlePlaybookUpdate();
    } else {
      handlePlaybookSave(args);
    }
    closeDrawer();
  };

  return (
    <>
      <CustomButton onClick={openOverlay} className="w-fit">
        <SaveRounded />
        <span>{isEditing ? "Update" : "Save"}</span>
        {isLoading && (
          <CircularProgress
            style={{
              textAlign: "center",
            }}
            size={20}
          />
        )}
      </CustomButton>

      <SavePlaybookOverlay
        isOpen={isSavePlaybookOverlayOpen}
        close={closeOverlay}
        saveCallback={handleSaveCallback}
      />
    </>
  );
}

export default SavePlaybookButton;
