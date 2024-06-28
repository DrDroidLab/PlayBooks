import { CircularProgress } from "@mui/material";
import { useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import styles from "./playbooks.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addStep,
  playbookSelector,
} from "../../store/features/playbook/playbookSlice.ts";
import { stepsToPlaybook } from "../../utils/parser/playbook/stepsToplaybook.ts";
import SavePlaybookOverlay from "./SavePlaybookOverlay.jsx";
import { useNavigate } from "react-router-dom";
import {
  useUpdatePlaybookMutation,
  useCreatePlaybookMutation,
} from "../../store/features/playbook/api/index.ts";
import { renderTimestamp } from "../../utils/DateUtils.js";

function StepActions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { steps, isEditing, lastUpdatedAt } = useSelector(playbookSelector);
  const playbookVal = useSelector(playbookSelector);
  const [isSaved, setIsSaved] = useState(false);
  const [isSavePlaybookOverlayOpen, setIsSavePlaybookOverlayOpen] =
    useState(false);
  const [triggerUpdatePlaybook, { isLoading: updateLoading }] =
    useUpdatePlaybookMutation();
  const [triggerCreatePlaybook, { isLoading: createLoading }] =
    useCreatePlaybookMutation();

  const handleAddCard = () => {
    dispatch(addStep());
  };

  const handleSave = () => {
    setIsSavePlaybookOverlayOpen(true);
  };

  const handlePlaybookSave = async ({ pbName, description }) => {
    setIsSavePlaybookOverlayOpen(false);

    const playbook = stepsToPlaybook(playbookVal, steps);

    const playbookObj = {
      playbook: {
        ...playbook,
        name: pbName,
        description,
      },
    };

    try {
      const response = await triggerCreatePlaybook(playbookObj).unwrap();
      setIsSaved(true);
      navigate(`/playbooks/${response.playbook?.id}`, { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlaybookUpdate = async () => {
    setIsSavePlaybookOverlayOpen(false);
    const playbook = stepsToPlaybook(playbookVal, steps);
    try {
      await triggerUpdatePlaybook({ ...playbook, id: playbookVal.id }).unwrap();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      style={{ marginLeft: "5px", marginTop: "10px", marginBottom: "10px" }}
      className="flex items-center">
      <button
        className={`${styles["pb-button"]} add_step`}
        onClick={handleAddCard}>
        + Add Step
      </button>
      {steps && steps?.length > 0 && (
        <>
          {!isEditing && (
            <button className={styles["pb-button"]} onClick={handleSave}>
              <SaveIcon style={{ fontSize: "medium" }} />
              <span style={{ marginLeft: "2px" }} className="save_playbook">
                Save
              </span>
            </button>
          )}
          {isEditing && (
            <button
              className={styles["pb-button"]}
              onClick={handlePlaybookUpdate}>
              <SaveIcon style={{ fontSize: "medium" }} />
              <span style={{ marginLeft: "2px" }}>Update</span>
            </button>
          )}
          {(updateLoading || createLoading) && (
            <CircularProgress
              style={{
                textAlign: "center",
              }}
              size={20}
            />
          )}
          {lastUpdatedAt && !(updateLoading || createLoading) && (
            <i className="text-sm text-gray-400">
              Last updated at: {renderTimestamp(lastUpdatedAt / 1000)}
            </i>
          )}
          {isSaved && (
            <div style={{ textAlign: "center" }}>
              <p>Playbook saved!!</p>
            </div>
          )}
        </>
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
