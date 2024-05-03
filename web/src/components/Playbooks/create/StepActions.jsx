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
import { useSelector } from "react-redux";
import {
  playbookSelector,
  stepsSelector,
} from "../../../store/features/playbook/playbookSlice.ts";

function StepActions() {
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

  const handlePlaybookSave = async ({ pbName }) => {
    setIsSavePlaybookOverlayOpen(false);

    const playbook = stepsToPlaybook(currentPlaybook, steps);

    const playbookObj = {
      playbook: {
        ...playbook,
        name: pbName,
      },
    };

    try {
      const response = await triggerCreatePlaybook(playbookObj).unwrap();
      navigate(`/playbooks/edit/${response.playbook?.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaybookUpdate = async () => {
    setIsSavePlaybookOverlayOpen(false);
    const playbook = stepsToPlaybook(currentPlaybook, steps);
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
    <div>
      <button
        className="text-violet-500 hover:text-white p-1 border-violet-500 border-[1px] text-sm rounded hover:bg-violet-500 transition-all my-2"
        onClick={handleSave}>
        <Save style={{ fontSize: "medium" }} />
        <span style={{ marginLeft: "2px" }} className="save_playbook">
          {isEditing ? "Update" : "Save"}
        </span>
      </button>
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
