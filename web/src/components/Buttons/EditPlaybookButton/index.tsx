import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { resetDrawerState } from "../../../store/features/drawers/drawersSlice.ts";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { currentPlaybookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { EditRounded } from "@mui/icons-material";
import useFakeLoading from "../../../hooks/common/useFakeLoading.ts";

function EditPlaybookButton() {
  const playbook = useSelector(currentPlaybookSelector);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { triggerLoading } = useFakeLoading();

  const handlePlaybook = () => {
    triggerLoading();
    dispatch(resetDrawerState());
    navigate(`/playbooks/${playbook?.id}`);
  };

  return (
    <CustomButton onClick={handlePlaybook}>
      <EditRounded />
      <p>Edit Playbook</p>
    </CustomButton>
  );
}

export default EditPlaybookButton;
