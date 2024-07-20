import React, { useState } from "react";
import ValueComponent from "./ValueComponent";
import useIsPrefetched from "../hooks/useIsPrefetched.ts";
import usePlaybookKey from "../hooks/usePlaybookKey.ts";
import { useDispatch, useSelector } from "react-redux";
import {
  currentPlaybookSelector,
  setCurrentPlaybookKey,
} from "../store/features/playbook/playbookSlice.ts";
import { Check, Edit } from "@mui/icons-material";

type HeadingTitleProps = {
  heading: string;
};

function HeadingTitle({ heading }: HeadingTitleProps) {
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const isPrefetched = useIsPrefetched();
  const [executionId] = usePlaybookKey("executionId");
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const dispatch = useDispatch();
  const [isOnPlaybookPage] = usePlaybookKey("isOnPlaybookPage");

  const setName = (value: string) => {
    dispatch(setCurrentPlaybookKey({ key: "name", value }));
  };

  return (
    <div className="flex gap-2 items-center">
      {showEdit ? (
        <form onSubmit={() => setShowEdit(!showEdit)}>
          <ValueComponent
            valueOptions={[]}
            error={undefined}
            valueType={"STRING"}
            onValueChange={setName}
            value={currentPlaybook?.name}
            placeHolder={"Enter Playbook name"}
            length={300}
          />
        </form>
      ) : (
        <div
          className={`${!isOnPlaybookPage ? "" : "cursor-pointer text-sm"}`}
          onClick={isOnPlaybookPage ? () => setShowEdit(!showEdit) : () => {}}>
          {!isPrefetched && isOnPlaybookPage ? "Editing - " : ""}{" "}
          {currentPlaybook?.name || heading}
          {isPrefetched && <> - {executionId}</>}
        </div>
      )}
      {isOnPlaybookPage && !isPrefetched && (
        <button className="ml-2 text-xs bg-white hover:text-white hover:bg-violet-500 text-violet-500 hover:color-white-500 p-1 border border-violet-500 transition-all rounded">
          <div className="icon" onClick={() => setShowEdit(!showEdit)}>
            {showEdit ? <Check /> : <Edit />}
          </div>
        </button>
      )}
    </div>
  );
}

export default HeadingTitle;
