import { ErrorOutlineRounded } from "@mui/icons-material";
import handleTaskTypeOptions from "../../../utils/conditionals/handleTaskTypeOptions";
import useCurrentStep from "../../../hooks/playbooks/step/useCurrentStep";
import { extractSource } from "../../../utils/playbook/extractData";
import { useSelector } from "react-redux";
import { additionalStateSelector } from "../../../store/features/drawers/selectors";

function ParentStepNotConfigured() {
  const { source } = useSelector(additionalStateSelector);
  const sourceId = extractSource(source);
  const [parentStep] = useCurrentStep(sourceId);
  const taskTypeOptions = handleTaskTypeOptions(parentStep);

  if (taskTypeOptions.length > 0) return;

  return (
    <div className="bg-red-50 p-2 m-2 flex items-center gap-1 my-1 rounded flex-wrap">
      <ErrorOutlineRounded color="error" component={"svg"} fontSize="inherit" />
      <p className="text-xs">You have not configured the parent step yet.</p>
    </div>
  );
}

export default ParentStepNotConfigured;
