import { useDispatch, useSelector } from "react-redux";
import { setDynamicAlertKey } from "../../store/features/dynamicAlerts/dynamicAlertsSlice";
import { DynamicAlertType } from "../../types";
import { dynamicAlertSelector } from "../../store/features/dynamicAlerts/selectors";
import getNestedValue from "../../utils/common/getNestedValue";

type UseDynamicAlertsKeyReturnType = [
  DynamicAlertType[keyof DynamicAlertType],
  (value: any) => void,
];

function useDynamicAlertsKey(
  key: keyof DynamicAlertType,
): UseDynamicAlertsKeyReturnType {
  const dynamicAlert = useSelector(dynamicAlertSelector);
  const dispatch = useDispatch();

  const setValue = (value: any) => {
    dispatch(setDynamicAlertKey({ key, value }));
  };

  return [getNestedValue(dynamicAlert, key), setValue];
}

export default useDynamicAlertsKey;
