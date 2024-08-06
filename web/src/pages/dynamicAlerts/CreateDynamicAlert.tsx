import { useEffect } from "react";
import CustomButton from "../../components/common/CustomButton";
import AddCondition from "../../components/DynamicAlerts/create/AddCondition";
import AddMetric from "../../components/DynamicAlerts/create/AddMetric";
import AddNotification from "../../components/DynamicAlerts/create/AddNotification";
import Heading from "../../components/Heading";
import CustomInput from "../../components/Inputs/CustomInput";
import {
  useLazyGetPlaybookQuery,
  usePlaybookBuilderOptionsQuery,
} from "../../store/features/playbook/api";
import { InputTypes } from "../../types";
import { useDispatch } from "react-redux";
import {
  createPlaybookForDynamicAlert,
  resetState as resetPlaybookState,
} from "../../store/features/playbook/playbookSlice";
import { routes } from "../../routes";
import { showSnackbar } from "../../store/features/snackbar/snackbarSlice";
import { useNavigate, useParams } from "react-router-dom";
import useDynamicAlertsKey from "../../hooks/dynamicAlerts/useDynamicAlertsKey";
import { useCreateDynamicAlertMutation } from "../../store/features/dynamicAlerts/api";
import Loading from "../../components/common/Loading";
import { useLazyGetDynamicAlertQuery } from "../../store/features/dynamicAlerts/api";

function CreateDynamicAlert() {
  const { alert_id: alertId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [triggerSave, { isLoading }] = useCreateDynamicAlertMutation();
  usePlaybookBuilderOptionsQuery();
  const [name, setName] = useDynamicAlertsKey("name");
  const [triggerGetAlert, { isLoading: alertLoading }] =
    useLazyGetDynamicAlertQuery();
  const [triggerGetPlaybook, { isLoading: playbookLoading }] =
    useLazyGetPlaybookQuery();
  const loading = alertLoading || isLoading || playbookLoading;

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

  const fetchData = async () => {
    if (!alertId) return;
    const data = await triggerGetAlert(alertId).unwrap();
    const playbookId = data?.playbooks?.[0]?.id;
    await triggerGetPlaybook({ playbookId });
  };

  useEffect(() => {
    if (alertId != null) {
      fetchData();
    }
  }, [alertId]);

  if (loading) return <Loading />;

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
        <AddCondition />
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
