import { useEffect } from "react";
import CustomButton from "../../components/common/CustomButton";
import AddCondition from "../../components/DynamicAlerts/create/AddCondition";
import AddMetric from "../../components/DynamicAlerts/create/AddMetric";
import AddNotification from "../../components/DynamicAlerts/create/AddNotification";
import Heading from "../../components/Heading";
import CustomInput from "../../components/Inputs/CustomInput";
import { usePlaybookBuilderOptionsQuery } from "../../store/features/playbook/api";
import { InputTypes } from "../../types";
import { useDispatch } from "react-redux";
import {
  createPlaybookForDynamicAlert,
  resetState as resetPlaybookState,
} from "../../store/features/playbook/playbookSlice";

function CreateDynamicAlert() {
  const dispatch = useDispatch();
  usePlaybookBuilderOptionsQuery();

  useEffect(() => {
    dispatch(createPlaybookForDynamicAlert());

    return () => {
      dispatch(resetPlaybookState());
    };
  }, []);

  const handleSave = () => {};

  return (
    <div>
      <Heading heading={"Dynamic Alerts(beta)"} />
      <div className="p-6 flex flex-col gap-3 bg-white border rounded m-2">
        <CustomInput
          inputType={InputTypes.TEXT}
          label="Alert name"
          value={""}
          className="!w-[200px]"
        />
        <AddMetric />
        <hr />
        <AddCondition />
        <hr />
        <AddNotification />

        <CustomButton className="w-fit" onClick={handleSave}>
          Save
        </CustomButton>
      </div>
    </div>
  );
}

export default CreateDynamicAlert;
