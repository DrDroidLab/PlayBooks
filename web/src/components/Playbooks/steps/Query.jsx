/* eslint-disable react-hooks/exhaustive-deps */
import PlaybookStep from "./PlaybookStep";
import AddSource from "./AddSource.jsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import AddDataSourcesDrawer from "../../common/Drawers/AddDataSourcesDrawer.jsx";

function Query({ index }) {
  const [step] = useCurrentStep(index);

  return (
    <div>
      <div className="flex items-center gap-2">
        <AddSource index={index} />
      </div>

      {step?.source && <PlaybookStep index={index} />}
      <AddDataSourcesDrawer />
    </div>
  );
}

export default Query;
