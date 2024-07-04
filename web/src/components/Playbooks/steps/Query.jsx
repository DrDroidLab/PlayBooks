/* eslint-disable react-hooks/exhaustive-deps */
import PlaybookStep from "./PlaybookStep";
import AddSource from "./AddSource.jsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import AddDataSourcesDrawer from "../../common/Drawers/AddDataSourcesDrawer.jsx";

function Query({ id }) {
  const [step] = useCurrentStep(id);

  return (
    <div>
      <div className="flex items-center gap-2">
        <AddSource id={id} />
      </div>

      {step?.source && <PlaybookStep id={id} />}
      <AddDataSourcesDrawer />
    </div>
  );
}

export default Query;
