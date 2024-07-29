import { useState } from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { SaveRounded } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import {
  useCreatePlaybookMutation,
  useUpdatePlaybookMutation,
} from "../../../store/features/playbook/api/index.ts";
import SavePlaybookOverlay from "../../Playbooks/SavePlaybookOverlay.jsx";
import { useNavigate } from "react-router-dom";
import usePermanentDrawerState from "../../../hooks/common/usePermanentDrawerState.ts";
import stateToPlaybook from "../../../utils/parser/playbook/stateToPlaybook.ts";
import useIsExisting from "../../../hooks/playbooks/useIsExisting.ts";
import handlePlaybookSavingValidations from "../../../utils/playbook/handlePlaybookSavingValidations.ts";

function SavePlaybookButton() {
  const navigate = useNavigate();
  const { closeDrawer } = usePermanentDrawerState();
  const isExisting = useIsExisting();
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

    const error = handlePlaybookSavingValidations();
    if (error) return;

    try {
      const res = await triggerUpdatePlaybook(stateToPlaybook()).unwrap();
      if (!res.success) return;
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };

  const handlePlaybookSave = async () => {
    setIsSavePlaybookOverlayOpen(false);
    const error = handlePlaybookSavingValidations();
    if (error) return;

    try {
      const response = await triggerCreatePlaybook(stateToPlaybook()).unwrap();
      navigate(`/playbooks/${response.playbook?.id}`, { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCallback = () => {
    if (isExisting) {
      handlePlaybookUpdate();
    } else {
      handlePlaybookSave();
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

      {isSavePlaybookOverlayOpen && (
        <SavePlaybookOverlay
          isOpen={isSavePlaybookOverlayOpen}
          close={closeOverlay}
          saveCallback={handleSaveCallback}
        />
      )}
    </>
  );
}

export default SavePlaybookButton;
