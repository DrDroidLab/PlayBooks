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
  const { view, currentPlaybook, isEditing, isOnPlaybookPage } =
    useSelector(playbookSelector);
  const isPrefetched = useIsPrefetched();
  const showExecution = useShowExecution();
  const isPlaybookPage =
    Object.keys(currentPlaybook ?? {}).length > 0 || isOnPlaybookPage;

  if (!isPlaybookPage) {
    return null;
  }

  return (
    <div className="flex gap-2 items-center">
      {view === "builder" && !isPrefetched && <SavePlaybookButton />}
      {isEditing && !isPrefetched && <CopyPlaybookButton />}
      {showExecution && <ExecutionButton />}
      {isPrefetched && <EditPlaybookButton />}
      {!isPrefetched && <PastExecutionsButton />}
    </div>
  );
}

export default HeadingPlaybookButtons;
