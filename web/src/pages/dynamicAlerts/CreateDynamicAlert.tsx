import { useEffect } from "react";
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
import { useParams } from "react-router-dom";
import useDynamicAlertsKey from "../../hooks/dynamicAlerts/useDynamicAlertsKey";
import Loading from "../../components/common/Loading";
import { useLazyGetDynamicAlertQuery } from "../../store/features/dynamicAlerts/api";
import { resetDynamicAlertState } from "../../store/features/dynamicAlerts/dynamicAlertsSlice";
import SaveOrUpdateDynamicAlertButton from "../../components/Buttons/SaveOrUpdateDynamicAlertButton";

function CreateDynamicAlert() {
  const { alert_id: alertId } = useParams();
  const dispatch = useDispatch();
  const { data: builderOptionsData, isLoading: builderOptionsLoading } =
    usePlaybookBuilderOptionsQuery();
  const [name, setName] = useDynamicAlertsKey("name");
  const [triggerGetAlert, { isLoading: alertLoading }] =
    useLazyGetDynamicAlertQuery();
  const [triggerGetPlaybook, { isLoading: playbookLoading }] =
    useLazyGetPlaybookQuery();
  const loading = alertLoading || playbookLoading || builderOptionsLoading;

  useEffect(() => {
    dispatch(createPlaybookForDynamicAlert());

    return () => {
      dispatch(resetPlaybookState());
      dispatch(resetDynamicAlertState());
    };
  }, []);

  const fetchData = async () => {
    if (!alertId) return;
    const data = await triggerGetAlert(alertId).unwrap();
    const playbookId = data?.playbooks?.[0]?.id;
    if (playbookId) await triggerGetPlaybook({ playbookId });
  };

  useEffect(() => {
    if (alertId != null && builderOptionsData) {
      fetchData();
    }
  }, [alertId, builderOptionsData]);

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

        <SaveOrUpdateDynamicAlertButton />
      </div>
    </div>
  );
}

export default CreateDynamicAlert;
