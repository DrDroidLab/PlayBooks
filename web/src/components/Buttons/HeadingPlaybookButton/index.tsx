import React from "react";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import SavePlaybookButton from "../SavePlaybookButton/index.tsx";
import useShowExecution from "../../../hooks/useShowExecution.ts";
import ExecutionButton from "../ExecutionButton/index.tsx";
import EditPlaybookButton from "../EditPlaybookButton/index.tsx";
import CopyPlaybookButton from "../CopyPlaybookButton/index.tsx";
import PastExecutionsButton from "../PastExecutionsButton/index.tsx";

function HeadingPlaybookButtons() {
  const { isEditing, isOnPlaybookPage } = useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const showExecution = useShowExecution();

  if (!isOnPlaybookPage) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      {!isPrefetched && <SavePlaybookButton />}
      {isEditing && !isPrefetched && <CopyPlaybookButton />}
      {showExecution && <ExecutionButton />}
      {isPrefetched && <EditPlaybookButton />}
      {!isPrefetched && <PastExecutionsButton />}
    </div>
  );
}

export default HeadingPlaybookButtons;
