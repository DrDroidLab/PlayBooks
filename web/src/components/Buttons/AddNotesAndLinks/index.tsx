import React from "react";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Add } from "@mui/icons-material";
import usePermanentDrawerState from "../../../hooks/common/usePermanentDrawerState.ts";
import { useDispatch, useSelector } from "react-redux";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import {
  playbookSelector,
  setCurrentVisibleStep,
} from "../../../store/features/playbook/playbookSlice.ts";
import useCurrentStep from "../../../hooks/playbooks/step/useCurrentStep.ts";

const stepDetailsId = PermanentDrawerTypes.STEP_DETAILS;

function AddNotesAndLinks({ id }) {
  const dispatch = useDispatch();
  const [step] = useCurrentStep(id);
  const { currentVisibleStep } = useSelector(playbookSelector);
  const { toggle, openDrawer, permanentView, addAdditionalData } =
    usePermanentDrawerState();
  const isPresent = step?.notes || (step?.external_links?.length ?? 0) > 0;

  const handleNoAction = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const showStepDetails = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    handleNoAction(e);
    if (
      permanentView === stepDetailsId &&
      currentVisibleStep === stepDetailsId
    ) {
      toggle(stepDetailsId);
      return;
    }
    addAdditionalData({});
    dispatch(setCurrentVisibleStep(id));
    openDrawer(stepDetailsId);
  };

  return (
    <CustomButton onClick={showStepDetails}>
      {isPresent ? (
        <>
          <p>View Notes and Links</p>
        </>
      ) : (
        <>
          <Add fontSize="small" />
          <p>Notes and Links</p>
        </>
      )}
    </CustomButton>
  );
}

export default AddNotesAndLinks;
