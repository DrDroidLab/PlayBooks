import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Tooltip } from "@mui/material";
import { VisibilityRounded } from "@mui/icons-material";
import RunButton from "../../Buttons/RunButton/index.tsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function StepButtons({ stepId, handleClick }) {
  const [step] = useCurrentStep(stepId);

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center gap-1 p-1">
      <CustomButton
        onClick={handleClick}
        className="text-violet-500 cursor-pointer">
        <Tooltip title={"Show Config"}>
          <VisibilityRounded fontSize="medium" />
        </Tooltip>
      </CustomButton>
      <div onClick={handleNoAction}>
        <RunButton id={step.id} />
      </div>
    </div>
  );
}

export default StepButtons;
