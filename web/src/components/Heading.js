import { Grid, Tooltip } from "@mui/material";
import React, { useState } from "react";
import TimeRangePicker from "./TimeRangePicker";
import Refresh from "../Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import styles from "./index.module.css";
import {
  Check,
  ChevronLeftRounded,
  ContentCopy,
  Edit,
} from "@mui/icons-material";
import ValueComponent from "./ValueComponent";
import { useDispatch, useSelector } from "react-redux";
import {
  playbookSelector,
  setName,
  setPlaybookKey,
} from "../store/features/playbook/playbookSlice.ts";
import CustomTimeRangePicker from "./common/TimeRangePicker/TimeRangePicker.jsx";
import { useNavigate } from "react-router-dom";
import useHasPreviousPage from "../hooks/useHasPreviousPage.ts";
import StepActions from "./Playbooks/create/StepActions.jsx";

const renderChildren = (children) => {
  return React.Children.map(children, (child) => {
    return <Grid item>{child}</Grid>;
  });
};

const Heading = ({
  subHeading,
  heading,
  subHeadingLink,
  onTimeRangeChangeCb,
  onRefreshCb,
  children,
  defaultTimeRange,
  defaultCustomTimeRange,
  defaultCustomTillNowTimeRange,
  handleGlobalExecute,
  showRunAll = false,
  showEditTitle = false,
  customTimeRange = false,
  copyPlaybook,
  showCopy,
  isPlayground = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasPreviousPage = useHasPreviousPage();
  const [isRefreshBtnDisabled, setIsRefreshBtnDisabled] = React.useState(false);
  const [showEdit, setShowEdit] = useState("");
  const playbook = useSelector(playbookSelector);

  const handleRefreshButtonDisable = (isDisabled) => {
    setIsRefreshBtnDisabled(isDisabled);
  };

  const goBack = () => {
    navigate(-1);
  };

  const handleDescription = (e) => {
    const value = e.target.value;
    dispatch(setPlaybookKey({ key: "description", value: value }));
  };

  return (
    <>
      <div
        style={{ zIndex: "90" }}
        className="w-full h-[80px] top-0 py-3 flex justify-between bg-white border-b border-gray-300 px-4 items-center sticky">
        <div className="flex gap-2 items-center">
          {hasPreviousPage && (
            <div className="cursor-pointer text-xl font-bold" onClick={goBack}>
              <ChevronLeftRounded />
            </div>
          )}
          <div className="flex-col justify-items-center">
            {!!subHeading && !subHeadingLink ? (
              <div className="text-xs text-gray-400">{subHeading}</div>
            ) : null}
            <div>
              <div className="text-xs sm:text-lg font-semibold text-gray-800">
                <div className="flex gap-2 items-center">
                  {showEdit ? (
                    <>
                      <ValueComponent
                        valueType={"STRING"}
                        onValueChange={(val) => dispatch(setName(val))}
                        value={playbook.name}
                        placeHolder={"Enter Playbook name"}
                        length={300}
                      />
                    </>
                  ) : (
                    <div
                      style={!showEditTitle ? {} : { cursor: "pointer" }}
                      onClick={
                        showEditTitle ? () => setShowEdit(!showEdit) : () => {}
                      }
                      className="add_title">
                      {playbook.isEditing ? "Editing - " : ""}{" "}
                      {playbook.name || heading}
                    </div>
                  )}
                  {showEditTitle && (
                    <div
                      className="icon"
                      onClick={() => setShowEdit(!showEdit)}>
                      {showEdit ? <Check /> : <Edit />}
                    </div>
                  )}
                  {showRunAll && (
                    <button
                      className={`${styles["pb-button"]} run_all`}
                      onClick={handleGlobalExecute}>
                      <PlayArrowIcon style={{ fontSize: "medium" }} />
                      <span style={{ marginLeft: "2px" }}>Run All</span>
                    </button>
                  )}
                  {(showCopy || playbook.isEditing) && (
                    <button
                      className={styles["pb-button"]}
                      onClick={copyPlaybook}>
                      <Tooltip title="Copy this Playbook">
                        <ContentCopy />
                      </Tooltip>
                    </button>
                  )}
                </div>
                {(Object.keys(playbook.currentPlaybook).length > 0 ||
                  showEditTitle) && (
                  <input
                    className="font-normal text-xs p-1 w-[350px] rounded border border-transparent hover:border-gray-300 transition-all"
                    placeholder="+ Add Description..."
                    value={playbook.description}
                    onChange={handleDescription}
                  />
                )}
                {!!subHeadingLink && !!subHeading ? (
                  <a
                    style={{ color: "blue", fontSize: "15px" }}
                    target="_blank"
                    rel="noreferrer"
                    href={subHeadingLink}>
                    {subHeading}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {playbook.view === "builder" && playbook.steps.length > 0 && (
            <StepActions />
          )}
          {renderChildren(children)}
          {customTimeRange && (
            <CustomTimeRangePicker
              onRefreshButtonDisable={handleRefreshButtonDisable}
              onTimeRangeChangeCb={onTimeRangeChangeCb}
              isPlayground={isPlayground}
            />
          )}
          {onTimeRangeChangeCb && !customTimeRange ? (
            <Grid item>
              <TimeRangePicker
                onTimeRangeChangeCb={onTimeRangeChangeCb}
                defaultTimeRange={defaultTimeRange}
                defaultCustomTimeRange={defaultCustomTimeRange}
                defaultCustomTillNowTimeRange={defaultCustomTillNowTimeRange}
                onRefreshButtonDisable={handleRefreshButtonDisable}
              />
            </Grid>
          ) : null}
          {onRefreshCb ? (
            <Grid item>
              <Refresh
                onRefreshCb={onRefreshCb}
                disabled={isRefreshBtnDisabled}
              />
            </Grid>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default Heading;
