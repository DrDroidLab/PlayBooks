import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { resetDrawerState } from "../../../store/features/drawers/drawersSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { EditRounded } from "@mui/icons-material";

function EditPlaybookButton() {
  const playbook = useSelector(playbookSelector);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePlaybook = () => {
    dispatch(resetDrawerState());
    navigate(`/playbooks/${playbook.id}`);
  };

  return (
    <CustomButton onClick={handlePlaybook}>
      <EditRounded />
      <p>Edit Playbook</p>
    </CustomButton>
  );
}

export default EditPlaybookButton;
