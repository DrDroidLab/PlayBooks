import { useNavigate, useParams } from "react-router-dom";
import { routes } from "../../../routes";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice";
import CustomButton from "../../common/CustomButton";
import { useDispatch } from "react-redux";
import {
  useCreateDynamicAlertMutation,
  useUpdateDynamicAlertMutation,
} from "../../../store/features/dynamicAlerts/api";
import handlePlaybookSavingValidations from "../../../utils/playbook/handlePlaybookSavingValidations";
import { useUpdatePlaybookMutation } from "../../../store/features/playbook/api";
import stateToPlaybook from "../../../utils/parser/playbook/stateToPlaybook";

function SaveOrUpdateDynamicAlertButton() {
  const { alert_id: alertId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [triggerSave, { isLoading: saveLoading }] =
    useCreateDynamicAlertMutation();
  const [triggerUpdate, { isLoading: updateLoading }] =
    useUpdateDynamicAlertMutation();
  const [triggerUpdatePlaybook, { isLoading: updatePbLoading }] =
    useUpdatePlaybookMutation();

  const loading = saveLoading || updateLoading || updatePbLoading;

  const handleUpdate = async () => {
    try {
      const error = handlePlaybookSavingValidations();
      if (error) throw error;
      const response = await triggerUpdatePlaybook(stateToPlaybook()).unwrap();

      if (response.success) {
        const workflowUpdateResponse = await triggerUpdate().unwrap();
        if (workflowUpdateResponse.success) {
          navigate(routes.DYNAMIC_ALERTS);
        }
      }
    } catch (e: any) {
      dispatch(showSnackbar(e?.message?.toString() ?? e.toString()));
    }
  };

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

  const handleClick = () => {
    if (alertId) {
      handleUpdate();
    } else {
      handleSave();
    }
  };

  return (
    <CustomButton disabled={loading} className="w-fit" onClick={handleClick}>
      {loading ? "Loading.." : alertId ? "Update" : "Save"}
    </CustomButton>
  );
}

export default SaveOrUpdateDynamicAlertButton;
