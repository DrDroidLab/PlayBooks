import React, { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { SaveRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import {
  useCreatePlaybookMutation,
  useUpdatePlaybookMutation,
} from "../../../store/features/playbook/api/index.ts";
import { useDispatch, useSelector } from "react-redux";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import SavePlaybookOverlay from "../../Playbooks/SavePlaybookOverlay.jsx";
import { useNavigate } from "react-router-dom";
import { setPlaybookKey } from "../../../store/features/playbook/playbookSlice.ts";
import handlePlaybookSavingValidations from "../../../utils/handlePlaybookSavingValidations.ts";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import stateToPlaybook from "../../../utils/parser/playbook/stateToPlaybook.ts";
import useIsExisting from "../../../hooks/useIsExisting.ts";

type SavePlaybookButtonPropTypes = {
  shouldNavigate?: boolean;
};

function SavePlaybookButton({
  shouldNavigate = true,
}: SavePlaybookButtonPropTypes) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { closeDrawer } = usePermanentDrawerState();
  const isExisting = useIsExisting();
  const currentPlaybook = useSelector(currentPlaybookSelector);
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
    if (currentPlaybook?.steps?.length === 0) {
      dispatch(showSnackbar("You cannot save a playbook with no steps"));
      return;
    }

    try {
      await triggerUpdatePlaybook(stateToPlaybook()).unwrap();
      if (shouldNavigate) {
        navigate(`/playbooks`);
        return;
      }
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };

  const handlePlaybookSave = async ({ pbName, description }) => {
    setIsSavePlaybookOverlayOpen(false);
    dispatch(setPlaybookKey({ key: "name", value: pbName }));

    const error = handlePlaybookSavingValidations();
    if (error) return;

    const playbookObj = {
      playbook: { ...stateToPlaybook(), name: pbName, description },
    };

    try {
      const response = await triggerCreatePlaybook(playbookObj).unwrap();
      navigate(`/playbooks/${response.playbook?.id}`, { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCallback = (args: any) => {
    if (isExisting) {
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
        <span>{isExisting ? "Update" : "Save"}</span>
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
