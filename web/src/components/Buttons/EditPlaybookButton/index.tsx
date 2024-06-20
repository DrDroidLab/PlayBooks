import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { resetDrawerState } from "../../../store/features/drawers/drawersSlice.ts";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SlowMotionVideoRounded } from "@mui/icons-material";

function PastExecutionsButton() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePastExecutions = () => {
    dispatch(resetDrawerState());
    navigate(`/playbooks/executions/list`);
  };

  return (
    <CustomButton onClick={handlePastExecutions}>
      <SlowMotionVideoRounded />
      <p>Past Executions</p>
    </CustomButton>
  );
}

export default PastExecutionsButton;
