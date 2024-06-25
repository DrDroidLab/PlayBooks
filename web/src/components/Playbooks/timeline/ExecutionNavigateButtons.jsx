import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Tooltip } from "@mui/material";
import {
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import usePlaybookKey from "../../../hooks/usePlaybookKey.ts";

function ExecutionNavigateButtons({ steps }) {
  const { currentVisibleStep } = useSelector(playbookSelector);
  const showNextStepLogButton = currentVisibleStep !== steps.length - 1;
  const showPreviousStepLogButton = currentVisibleStep !== 0;
  const [, setShouldScroll] = usePlaybookKey("shouldScroll");

  const handleNextStepClick = () => {
    setShouldScroll("next");
  };

  const handlePreviousStepClick = () => {
    setShouldScroll("previous");
  };

  return (
    <div className="fixed bottom-0 right-0 m-2 z-50 flex flex-col gap-2">
      {showPreviousStepLogButton && (
        <CustomButton
          className="rounded-full"
          onClick={handlePreviousStepClick}>
          <Tooltip title="Previous Execution">
            <KeyboardArrowUpRounded fontSize="medium" />
          </Tooltip>
        </CustomButton>
      )}

      {showNextStepLogButton && (
        <CustomButton className="rounded-full" onClick={handleNextStepClick}>
          <Tooltip title="Next Execution">
            <KeyboardArrowDownRounded fontSize="medium" />
          </Tooltip>
        </CustomButton>
      )}
    </div>
  );
}

export default ExecutionNavigateButtons;
