import { ExecutionStatus } from "../../types";

export const handleStatus = (status: string) => {
  let className = "border p-1 text-xs bg-gray-50 w-fit rounded-full ";
  switch (status) {
    case ExecutionStatus.WORKFLOW_CREATED:
    case ExecutionStatus.CREATED:
      className += "bg-gray-200";
      break;

    case ExecutionStatus.WORKFLOW_SCHEDULED:
    case ExecutionStatus.SCHEDULED:
      className += "bg-pink-500 text-white";
      break;

    case ExecutionStatus.WORKFLOW_RUNNING:
    case ExecutionStatus.RUNNING:
      className += "bg-violet-500 text-white";
      break;

    case ExecutionStatus.WORKFLOW_FINISHED:
    case ExecutionStatus.FINISHED:
      className += "bg-green-500 text-white";
      break;

    case ExecutionStatus.WORKFLOW_FAILED:
    case ExecutionStatus.FAILED:
      className += "bg-red-500 text-white";
      break;

    default:
      break;
  }
  return <div className={className}>{status}</div>;
};
