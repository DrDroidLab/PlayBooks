import { Grid } from "@mui/material";
import React, { useState } from "react";
import TimeRangePicker from "./TimeRangePicker";
import Refresh from "../Refresh";
import { Check, ChevronLeftRounded, Edit } from "@mui/icons-material";
import ValueComponent from "./ValueComponent";
import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import CustomTimeRangePicker from "./common/TimeRangePicker/TimeRangePicker.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import useHasPreviousPage from "../hooks/useHasPreviousPage.ts";
import useIsPrefetched from "../hooks/useIsPrefetched.ts";
import HeadingPlaybookButtons from "./Buttons/HeadingPlaybookButton/index.tsx";
import PlaybookDescription from "./PlaybookDescription/index.tsx";
import usePlaybookKey from "../hooks/usePlaybookKey.ts";

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
  customTimeRange = false,
  isPlayground = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasPreviousPage = useHasPreviousPage();
  const [isRefreshBtnDisabled, setIsRefreshBtnDisabled] = React.useState(false);
  const [showEdit, setShowEdit] = useState("");
  const playbook = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const isPlaybookPage = Object.keys(playbook.currentPlaybook).length > 0;
  const [name, setName] = usePlaybookKey("name");

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
                        onValueChange={setName}
                        value={name}
                        placeHolder={"Enter Playbook name"}
                        length={300}
                      />
                    </>
                  ) : (
                    <div
                      style={!isPlaybookPage ? {} : { cursor: "pointer" }}
                      onClick={
                        isPlaybookPage ? () => setShowEdit(!showEdit) : () => {}
                      }
                      className="add_title">
                      {playbook.isEditing && !isPrefetched ? "Editing - " : ""}{" "}
                      {playbook.name || heading}
                    </div>
                  )}
                  {isPlaybookPage && !isPrefetched && (
                    <button className="ml-2 text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded">
                      <div
                        className="icon"
                        onClick={() => setShowEdit(!showEdit)}>
                        {showEdit ? <Check /> : <Edit />}
                      </div>
                    </button>
                  )}
                </div>
                {!!subHeading && !subHeadingLink ? (
                  <div className="text-xs font-normal text-gray-400">
                    {subHeading}
                  </div>
                ) : null}
                <PlaybookDescription />
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
          <HeadingPlaybookButtons />
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
