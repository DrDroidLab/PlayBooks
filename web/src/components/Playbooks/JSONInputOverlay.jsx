/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import Overlay from "../Overlay";
import styles from "./index.module.css";
import { CloseRounded } from "@mui/icons-material";
import { playbookToSteps } from "../../utils/parser/playbooks/playbookToSteps.ts";
import { useDispatch } from "react-redux";
import { setSteps } from "../../store/features/playbook/playbookSlice.ts";

const JSONInputOverlay = ({ isOpen, toggleOverlay }) => {
  const [json, setJson] = useState("");
  const dispatch = useDispatch();

  const handlePlaybookConversion = () => {
    const playbook = playbookToSteps(JSON.parse(json), false, true);
    dispatch(setSteps(playbook));
    toggleOverlay();
  };

  return (
    <>
      {isOpen && (
        <Overlay visible={isOpen}>
          <div className={styles["actionOverlay"]}>
            <header className="text-gray-500 flex justify-between my-2">
              <div>Enter JSON</div>
              <div onClick={toggleOverlay} className="cursor-pointer">
                <CloseRounded />
              </div>
            </header>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}>
              <textarea
                className="border rounded resize-none text-black caret-black p-1 text-sm"
                placeholder="Enter JSON here..."
                autoFocus
                rows={18}
                spellCheck={false}
                value={json}
                onChange={(e) => {
                  setJson(e.target.value);
                }}
              />
            </div>
            <div className="mt-2">
              <button
                className="border border-violet-500 text-violet-500 p-1 text-xs rounded hover:text-white hover:bg-violet-500 transition-all"
                onClick={handlePlaybookConversion}>
                Convert to Playbook
              </button>
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
};

export default JSONInputOverlay;
