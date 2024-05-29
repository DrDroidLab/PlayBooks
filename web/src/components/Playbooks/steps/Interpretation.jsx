import React, { useState } from "react";
import Checkbox from "../../common/Checkbox/index.tsx";
import SelectInterpreterDropdown from "./SelectInterpreterDropdown";

function Interpretation({ index }) {
  const [selectInterpretation, setSelectInterpretation] = useState(false);

  const toggleInterpretation = () => {
    setSelectInterpretation(!selectInterpretation);
  };

  return (
    <div className="text-sm my-4 flex items-center gap-4 flex-wrap">
      <Checkbox
        id="insights"
        isChecked={selectInterpretation}
        label="Enable Insights"
        onChange={toggleInterpretation}
      />

      {selectInterpretation && <SelectInterpreterDropdown index={index} />}
    </div>
  );
}

export default Interpretation;
