import { useSelector } from "react-redux";
import { InputTypes } from "../../../../../types/inputs";
import CustomInput from "../../../../Inputs/CustomInput";
import { currentPlaybookSelector } from "../../../../../store/features/playbook/selectors";
import { isCSV } from "../../../../../utils/common/isCSV";
import { updateCardById } from "../../../../../utils/execution/updateCardById";
import useCurrentTask from "../../../../../hooks/playbooks/task/useCurrentTask";
import useIsPrefetched from "../../../../../hooks/playbooks/useIsPrefetched";
import isJSONString from "../../../../common/CodeAccordion/utils/isJSONString";

const key = "execution_configuration.bulk_execution_var_field";

type ExecutionVarFieldSelectionProps = {
  id?: string;
};

function ExecutionVarFieldSelection({ id }: ExecutionVarFieldSelectionProps) {
  const currentPlaybook = useSelector(currentPlaybookSelector);
  const [task] = useCurrentTask(id);
  const value = task?.execution_configuration?.bulk_execution_var_field;
  const global_variable_set = currentPlaybook?.global_variable_set ?? {};
  const variableOptions = Object.entries(global_variable_set).reduce(
    (acc: any, [key, value]) => {
      if (
        isCSV(
          isJSONString(JSON.stringify(value)) ? JSON.stringify(value) : value,
        )
      ) {
        acc.push({
          id: key,
          label: key,
        });
      }
      return acc;
    },
    [],
  );
  const isPrefetched = useIsPrefetched();

  const handleChange = (optionId: string) => {
    updateCardById(key, optionId, id);
  };

  return (
    <div className="mt-1">
      <CustomInput
        inputType={InputTypes.DROPDOWN}
        options={variableOptions}
        value={value}
        handleChange={handleChange}
        placeholder="Select an array variable"
        disabled={!!isPrefetched}
      />
    </div>
  );
}

export default ExecutionVarFieldSelection;
