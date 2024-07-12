import { Grid } from "@mui/material";
import React, { useState } from "react";
import { Check, Edit, HomeRounded } from "@mui/icons-material";
import ValueComponent from "./ValueComponent";
import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { useNavigate } from "react-router-dom";
import useIsPrefetched from "../hooks/useIsPrefetched.ts";
import HeadingPlaybookButtons from "./Buttons/HeadingPlaybookButton/index.tsx";
import PlaybookDescription from "./PlaybookDescription/index.tsx";
import usePlaybookKey from "../hooks/usePlaybookKey.ts";
import TimeRangeSelector from "./common/TimeRangeSelector/index.tsx";

const renderChildren = (children) => {
  return React.Children.map(children, (child) => {
    return <Grid item>{child}</Grid>;
  });
};

const Heading = ({
  subHeading = "",
  heading,
  subHeadingLink = undefined,
  children,
}) => {
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState("");
  const playbook = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const [isOnPlaybookPage] = usePlaybookKey("isOnPlaybookPage");
  const [name, setName] = usePlaybookKey("name");
  const [executionId] = usePlaybookKey("executionId");

  const goBack = () => {
    navigate("/");
  };

  return (
    <>
      <div
        style={{ zIndex: "90" }}
        className="w-full h-[80px] top-0 py-3 flex justify-between bg-white border-b border-gray-300 px-4 items-center sticky">
        <div className="flex gap-2 items-center">
          {isOnPlaybookPage && (
            <div
              className="cursor-pointer text-xl font-bold hover:text-violet-500 transition-all"
              onClick={goBack}>
              <HomeRounded />
            </div>
          )}
          <div className="flex-col justify-items-center">
            <div>
              <div className="text-xs sm:text-lg font-semibold text-gray-800">
                <div className="flex gap-2 items-center">
                  {showEdit ? (
                    <form onSubmit={() => setShowEdit(!showEdit)}>
                      <ValueComponent
                        valueType={"STRING"}
                        onValueChange={setName}
                        value={name}
                        placeHolder={"Enter Playbook name"}
                        length={300}
                      />
                    </form>
                  ) : (
                    <div
                      className={`${
                        !isOnPlaybookPage ? "" : "cursor-pointer text-sm"
                      }`}
                      onClick={
                        isOnPlaybookPage
                          ? () => setShowEdit(!showEdit)
                          : () => {}
                      }>
                      {playbook.isEditing && !isPrefetched ? "Editing - " : ""}{" "}
                      {playbook.name || heading}
                      {isPrefetched && <> - {executionId}</>}
                    </div>
                  )}
                  {isOnPlaybookPage && !isPrefetched && (
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
          <HeadingPlaybookButtons />
          {renderChildren(children)}
          {isOnPlaybookPage && <TimeRangeSelector />}
        </div>
      </div>
    </>
  );
};

export default Heading;
