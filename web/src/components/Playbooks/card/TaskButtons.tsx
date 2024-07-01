import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Tooltip } from "@mui/material";
import { VisibilityRounded } from "@mui/icons-material";

function TaskButtons({ taskId }) {
  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {};

  return (
    <div className="flex items-center gap-1 p-1">
      <CustomButton
        onClick={handleClick}
        className="text-violet-500 cursor-pointer">
        <Tooltip title={"Show Config"}>
          <VisibilityRounded fontSize="medium" />
        </Tooltip>
      </CustomButton>
      <div onClick={handleNoAction}>{/* <RunButton id={task.id} /> */}</div>
    </div>
  );
}

export default TaskButtons;
