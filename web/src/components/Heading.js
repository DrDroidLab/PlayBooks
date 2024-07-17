import { Grid } from "@mui/material";
import React from "react";
import { HomeRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import HeadingPlaybookButtons from "./Buttons/HeadingPlaybookButton/index.tsx";
import PlaybookDescription from "./PlaybookDescription/index.tsx";
import usePlaybookKey from "../hooks/usePlaybookKey.ts";
import TimeRangeSelector from "./common/TimeRangeSelector/index.tsx";
import HeadingTitle from "./HeadingTitle.tsx";

const renderChildren = (children) => {
  return React.Children.map(children, (child) => {
    return <Grid item>{child}</Grid>;
  });
};

const Heading = ({ subHeading = "", heading, children }) => {
  const navigate = useNavigate();
  const [isOnPlaybookPage] = usePlaybookKey("isOnPlaybookPage");

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
                <HeadingTitle heading={heading} />
                {subHeading && (
                  <div className="text-xs font-normal text-gray-400">
                    {subHeading}
                  </div>
                )}
                <PlaybookDescription />
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-stretch">
          <HeadingPlaybookButtons />
          {renderChildren(children)}
          {isOnPlaybookPage && <TimeRangeSelector />}
        </div>
      </div>
    </>
  );
};

export default Heading;
