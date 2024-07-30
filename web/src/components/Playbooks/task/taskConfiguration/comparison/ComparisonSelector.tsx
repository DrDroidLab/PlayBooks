import useCurrentTask from "../../../../../hooks/playbooks/task/useCurrentTask";
import useIsPrefetched from "../../../../../hooks/playbooks/useIsPrefetched";
import { updateCardById } from "../../../../../utils/execution/updateCardById";
import Checkbox from "../../../../common/Checkbox";
import TimeseriesOffestSelection from "./TimeseriesOffestSelection";

const key = "use_comparison";

type ComparisonSelectorProps = {
  id: string;
};

function ComparisonSelector({ id }: ComparisonSelectorProps) {
  const [task] = useCurrentTask(id);
  const isChecked = task?.ui_requirement?.[key];
  const isPrefetched = useIsPrefetched();

  const handleChange = () => {
    updateCardById(`ui_requirement.${key}`, !isChecked, id);
  };

  return (
    <div className="mt-2">
      <Checkbox
        id="use_comparison"
        isChecked={isChecked ?? false}
        label="Use Comparison"
        onChange={handleChange}
        isSmall={true}
        disabled={!!isPrefetched}
      />

      {isChecked && <TimeseriesOffestSelection id={id} />}
    </div>
  );
}

export default ComparisonSelector;
