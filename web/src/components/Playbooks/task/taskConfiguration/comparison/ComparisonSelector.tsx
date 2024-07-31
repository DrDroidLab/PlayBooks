import useCurrentTask from "../../../../../hooks/playbooks/task/useCurrentTask";
import useIsPrefetched from "../../../../../hooks/playbooks/useIsPrefetched";
import getNestedValue from "../../../../../utils/common/getNestedValue";
import { updateCardById } from "../../../../../utils/execution/updateCardById";
import Checkbox from "../../../../common/Checkbox";
import TimeseriesOffestSelection from "./TimeseriesOffestSelection";
import { CHECKBOX_KEY, DROPDOWN_KEY, TIMESERIES_OFFSET_ARR_KEY } from "./utils";

type ComparisonSelectorProps = {
  id: string;
};

function ComparisonSelector({ id }: ComparisonSelectorProps) {
  const [task] = useCurrentTask(id);
  const isChecked = getNestedValue(task, CHECKBOX_KEY);
  const isPrefetched = useIsPrefetched();

  const handleChange = () => {
    const value = !isChecked;
    updateCardById(CHECKBOX_KEY, value, id);
    if (!value) {
      updateCardById(DROPDOWN_KEY, null, id);
      updateCardById(TIMESERIES_OFFSET_ARR_KEY, undefined, id);
    }
  };

  return (
    <div className="mt-2">
      <Checkbox
        id="use_comparison"
        isChecked={isChecked ?? false}
        label="Also add from a previous window"
        onChange={handleChange}
        isSmall={true}
        disabled={!!isPrefetched}
      />

      {isChecked && <TimeseriesOffestSelection id={id} />}
    </div>
  );
}

export default ComparisonSelector;
