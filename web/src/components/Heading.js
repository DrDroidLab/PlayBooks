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
import { useLocation, useNavigate } from "react-router-dom";
import useHasPreviousPage from "../hooks/useHasPreviousPage.ts";
import StepActions from "./Playbooks/create/StepActions.jsx";
import useIsPrefetched from "../hooks/useIsPrefetched.ts";
import handleGlobalExecute from "../utils/execution/handleGlobalExecute.ts";

const renderChildren = (children) => {
  return React.Children.map(children, (child) => {
    return <Grid item>{child}</Grid>;
  });
};

const Heading = ({
  subHeading = "",
  heading,
  subHeadingLink = undefined,
  onTimeRangeChangeCb = true,
  onRefreshCb = true,
  children,
  defaultTimeRange = undefined,
  defaultCustomTimeRange = undefined,
  defaultCustomTillNowTimeRange = undefined,
  showRunAll = false,
  showEditTitle = false,
  customTimeRange = false,
  copyPlaybook = false,
  showCopy = false,
  isPlayground = false,
  showSave = true,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasPreviousPage = useHasPreviousPage();
  const [isRefreshBtnDisabled, setIsRefreshBtnDisabled] = React.useState(false);
  const [showEdit, setShowEdit] = useState("");
  const playbook = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();

  const handleRefreshButtonDisable = (isDisabled) => {
    setIsRefreshBtnDisabled(isDisabled);
  };
  const goBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
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
                  {showEditTitle && !isPrefetched && (
                    <div
                      className="icon"
                      onClick={() => setShowEdit(!showEdit)}>
                      {showEdit ? <Check /> : <Edit />}
                    </div>
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
                {!!subHeading && !subHeadingLink ? (
                  <div className="text-xs font-normal text-gray-400">
                    {subHeading}
                  </div>
                ) : null}
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
          {/* {showRunAll && playbook.steps?.length > 0 && (
            <button
              className="text-violet-500 hover:text-white p-1 border-violet-500 border-[1px] text-sm rounded hover:bg-violet-500 transition-all my-2"
              onClick={handleGlobalExecute}>
              <PlayArrowIcon style={{ fontSize: "medium" }} />
              <span style={{ marginLeft: "2px" }}>Run All</span>
            </button>
          )} */}
          {playbook.view === "builder" &&
            playbook.steps.length > 0 &&
            showSave &&
            !isPrefetched && <StepActions />}
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
