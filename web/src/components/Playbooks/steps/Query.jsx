/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from "react";
import PlaybookStep from "./PlaybookStep";
import CustomDrawer from "../../common/CustomDrawer/index.jsx";
import AddSource from "./AddSource.jsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function Query({ index }) {
  const [step] = useCurrentStep(index);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2">
        <AddSource index={index} />
      </div>

      {step?.source && <PlaybookStep index={index} />}
      <CustomDrawer
        isOpen={isDrawerOpen}
        setIsOpen={setDrawerOpen}
        src={"/data-sources/add"}
      />
    </div>
  );
}

export default Query;
