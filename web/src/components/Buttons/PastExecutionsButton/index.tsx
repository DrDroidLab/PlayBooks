import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { resetDrawerState } from "../../../store/features/drawers/drawersSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { SlowMotionVideoRounded } from "@mui/icons-material";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";

function PastExecutionsButton() {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePastExecutions = () => {
    dispatch(resetDrawerState());
    navigate(
      `/playbooks/executions/list?selected=playbook_name: ${currentPlaybook?.name}`,
    );
  };

  return (
    <CustomButton onClick={handlePastExecutions}>
      <SlowMotionVideoRounded />
      <p>Past Executions</p>
    </CustomButton>
  );
}

export default PastExecutionsButton;
