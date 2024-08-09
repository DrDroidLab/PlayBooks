import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask";
import useIsPrefetched from "../../../../hooks/playbooks/useIsPrefetched";
import Checkbox from "../../../common/Checkbox";
import { updateCardById } from "../../../../utils/execution/updateCardById";
import HandleResultTransformer from "./HandleTransformer";
import getNestedValue from "../../../../utils/common/getNestedValue";

const key =
  "execution_configuration.result_transformer_lambda_function.is_result_transformer_enabled";

type ResultTransformerProps = {
  id: string;
};

function ResultTransformer({ id }: ResultTransformerProps) {
  const [task] = useCurrentTask(id);
  const isPrefetched = useIsPrefetched();
  const value = getNestedValue(task, key) ?? false;

  const handleTransformer = (key: string) => {
    updateCardById(key, !value, id);
  };

  return (
    <div>
      <Checkbox
        id={key}
        isChecked={value}
        label="Add an output exporter"
        onChange={handleTransformer}
        isSmall={true}
        disabled={!!isPrefetched}
      />
      {value && <HandleResultTransformer id={id} />}
    </div>
  );
}

export default ResultTransformer;
