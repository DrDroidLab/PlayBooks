import React, { useState } from "react";
import Checkbox from "../../common/Checkbox/index.tsx";
import SelectInterpreterDropdown from "./SelectInterpreterDropdown";
import { unsupportedRunners } from "../../../utils/unsupportedRunners.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import { usePlaybookBuilderOptionsQuery } from "../../../store/features/playbook/api/playbookBuilderOptionsApi.ts";

function SelectInterpretation({ id }) {
  const [step] = useCurrentStep(id);
  const [selectInterpretation, setSelectInterpretation] = useState(
    step?.interpreter?.type ?? false,
  );
  const { data } = usePlaybookBuilderOptionsQuery();

  const toggleInterpretation = () => {
    setSelectInterpretation(!selectInterpretation);
  };

  if (
    data?.interpreterTypes === 0 &&
    unsupportedRunners.includes(step.source)
  ) {
    return <></>;
  }

  return (
    <div className="text-sm my-4 flex items-center gap-4 flex-wrap">
      <Checkbox
        id="insights"
        isChecked={selectInterpretation}
        label="Enable Insights"
        onChange={toggleInterpretation}
      />

      {selectInterpretation && <SelectInterpreterDropdown id={id} />}
    </div>
  );
}

export default SelectInterpretation;
