import getCurrentTask from "../getCurrentTask.ts";
import { extractLogs } from "./extractLogs.ts";

function handleStepBorderColor(stepId: string) {
  const [step] = getCurrentTask(stepId);
  const logs = extractLogs(stepId);
  const results = logs?.reduce((logResults, log) => {
    logResults.push(log.evaluation_result);
    return logResults;
  }, []);

  if (
    step?.outputs?.data?.length > 0 ||
    (results.length > 0 && results.find((result) => result))
  ) {
    return "green";
  }

  if (
    step?.outputError ||
    (results.length > 0 && results.findIndex((result) => result) === -1)
  ) {
    return "red";
  }
}

export default handleStepBorderColor;
