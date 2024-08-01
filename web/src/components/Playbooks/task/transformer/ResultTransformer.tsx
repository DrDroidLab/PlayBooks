import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask";
import useIsPrefetched from "../../../../hooks/playbooks/useIsPrefetched";
import Checkbox from "../../../common/Checkbox";
import { updateCardById } from "../../../../utils/execution/updateCardById";
import HandleResultTransformer from "./HandleTransformer";

const key = "ui_requirement.use_transformer";

type ResultTransformerProps = {
  id: string;
};

function ResultTransformer({ id }: ResultTransformerProps) {
  const [task] = useCurrentTask(id);
  const isPrefetched = useIsPrefetched();
  const value = task?.ui_requirement?.use_transformer ?? false;

  const handleTransformer = (key: string) => {
    updateCardById(key, !value, id);
  };

  return (
    <div>
      <Checkbox
        id={key}
        isChecked={value}
        label="Add a python transformer"
        onChange={handleTransformer}
        isSmall={true}
        disabled={!!isPrefetched}
      />
      {value && <HandleResultTransformer id={id} />}
    </div>
  );
}

export default ResultTransformer;
