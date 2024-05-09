import { TipsAndUpdatesRounded } from "@mui/icons-material";
import React from "react";
import Markdown from "react-markdown";

type InterpretationPropTypes = {
  type?: string;
  title?: string;
  description?: string;
  summary?: string;
};

function Interpretation({
  type = "Task",
  title,
  description,
  summary,
}: InterpretationPropTypes) {
  return (
    <div className="flex-[0.4] bg-pink-50 m-1 rounded ml-0 p-2 flex flex-col gap-2 overflow-scroll">
      <h1 className="font-bold lg:text-lg text-violet-600 flex gap-2 items-center">
        <TipsAndUpdatesRounded /> {type} Insights
      </h1>
      <hr className="border-t-violet-500 border-t-[0.5px] flex-grow-0" />
      <div className="text-xs flex flex-col gap-2">
        <Markdown className={"font-bold line-clamp-[2]"}>
          {title ?? "No interpretation found."}
        </Markdown>
        {description && (
          <Markdown className={"line-clamp-[10]"}>{description}</Markdown>
        )}
        {summary && (
          <Markdown className={"font-bold line-clamp-[3]"}>{summary}</Markdown>
        )}
      </div>
    </div>
  );
}

export default Interpretation;
