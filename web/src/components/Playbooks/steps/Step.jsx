/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import { Tooltip } from "@mui/material";
import styles from "../playbooks.module.css";
import { Launch } from "@mui/icons-material";
import Notes from "./Notes.jsx";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useDispatch } from "react-redux";
import {
  addExternalLinks,
  deleteStep,
  toggleExternalLinkVisibility,
} from "../../../store/features/playbook/playbookSlice.ts";
import ExternalLinks from "./ExternalLinks.jsx";
import Query from "./Query.jsx";
import { handleExecute } from "../../../utils/execution/handleExecute.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";

function Step({ step, index }) {
  const isPrefetched = useIsPrefetched();
  const [addQuery, setAddQuery] = useState(
    step?.isPrefetched ?? step.source ?? false,
  );
  const dispatch = useDispatch();

  function handleDeleteClick(index) {
    dispatch(deleteStep(index));
  }

  const toggleExternalLinks = () => {
    dispatch(toggleExternalLinkVisibility({ index }));
  };

  const setLinks = (links) => {
    dispatch(addExternalLinks({ index, externalLinks: links }));
  };

  return (
    <div className={styles["step-card"]}>
      <div
        className={styles["step-card-content"]}
        style={{ paddingBottom: "0px" }}>
        <div className={styles["step-name"]}>
          {step.isPrefetched && step.description && (
            <div className={styles.head}>
              <div className={styles.extLinks}>
                {step.externalLinks?.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.extLink}>
                    {link?.name || link.url} <Launch />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles["step-section"]}>
          <div className={styles["step-info"]}>
            <div>
              {/* <SelectOne
                options={options}
                selected={step.stepType}
                onChange={(id) => {
                  dispatch(setStepType({ index, stepType: id }));
                }}
              /> */}
              <div
                className={styles["addConditionStyle"]}
                onClick={() => setAddQuery(true)}>
                <b className="add_data">{!addQuery ? "+ Add Data" : "Data"}</b>
              </div>

              {addQuery && <Query step={step} index={index} />}
              {/* <HandleSelectedType
                selectedId={step.stepType}
                step={step}
                index={index}
              /> */}
            </div>
          </div>
          <Notes step={step} index={index} />
          {!isPrefetched && (
            <div className={styles["step-buttons"]}>
              {step.source && (
                <button
                  className={styles["pb-button"]}
                  onClick={() => handleExecute(step)}>
                  <Tooltip title="Run this Step">
                    <>
                      Run <PlayArrowIcon />
                    </>
                  </Tooltip>
                </button>
              )}
              <button
                className={styles["pb-button"]}
                onClick={() => handleDeleteClick(index)}>
                <Tooltip title="Remove this Step">
                  <DeleteIcon />
                </Tooltip>
              </button>
            </div>
          )}
          {!step.isPrefetched && (
            <div>
              <div>
                <div
                  className={styles["addConditionStyle"]}
                  onClick={toggleExternalLinks}>
                  <b className="ext_links">
                    {step.showExternalLinks ? "-" : "+"}
                  </b>{" "}
                  Add External Links
                </div>

                {step.showExternalLinks && (
                  <ExternalLinks
                    links={step.externalLinks}
                    setLinks={setLinks}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step;
