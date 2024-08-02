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
import { routes } from "../../routes";
import { showSnackbar } from "../../store/features/snackbar/snackbarSlice";
import { useNavigate } from "react-router-dom";
import { useCreateWorkflowMutation } from "../../store/features/workflow/api";
import useDynamicAlertsKey from "../../hooks/dynamicAlerts/useDynamicAlertsKey";

function CreateDynamicAlert() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [triggerSave, { isLoading }] = useCreateWorkflowMutation();
  usePlaybookBuilderOptionsQuery();
  const [name, setName] = useDynamicAlertsKey("name");

  useEffect(() => {
    dispatch(createPlaybookForDynamicAlert());

    return () => {
      dispatch(resetPlaybookState());
    };
  }, []);

  const handleSave = async () => {
    try {
      let response: any = {};
      response = await triggerSave().unwrap();
      if (response.success) {
        navigate(routes.DYNAMIC_ALERTS);
      }
    } catch (e: any) {
      dispatch(showSnackbar(e?.message?.toString() ?? e.toString()));
    }
  };

  return (
    <div>
      <Heading heading={"Dynamic Alerts(beta)"} />
      <div className="p-6 flex flex-col gap-3 bg-white border rounded m-2">
        <CustomInput
          inputType={InputTypes.TEXT}
          label="Alert name"
          value={name}
          handleChange={(val: string) => setName(val)}
          className="!w-[200px]"
        />
        <AddMetric />
        <hr />
        <AddCondition />
        <hr />
        <AddNotification />

        <CustomButton
          disabled={isLoading}
          className="w-fit"
          onClick={handleSave}>
          {isLoading ? "Loading.." : "Save"}
        </CustomButton>
      </div>
    </div>
  );
}

export default CreateDynamicAlert;
