import { TipsAndUpdatesRounded } from "@mui/icons-material";
import React from "react";
import Markdown from "react-markdown";

type InterpretationPropTypes = {
  title?: string;
  interpretation?: string;
};

function Interpretation({
  title = "Task",
  interpretation,
}: InterpretationPropTypes) {
  return (
    <div className="flex-[0.4] bg-pink-50 m-1 rounded ml-0 p-2 flex flex-col gap-2 overflow-scroll">
      <h1 className="font-bold lg:text-lg text-violet-600 flex gap-2 items-center">
        <TipsAndUpdatesRounded /> {title} Insights
      </h1>
      <hr className="border-t-violet-500 border-t-[0.5px] flex-grow-0" />
      <p className="line-clamp-[18] text-xs">
        <Markdown>{interpretation ?? "No interpretation found."}</Markdown>
      </p>
    </div>
  );
}

export default Interpretation;
