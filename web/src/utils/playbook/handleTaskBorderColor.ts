import getCurrentTask from "../getCurrentTask.ts";
import { extractLogs } from "./extractLogs.ts";

function handleTaskBorderColor(taskId: string) {
  const [task] = getCurrentTask(taskId);
  // const logs = extractLogs(taskId);
  // const results = logs?.reduce((logResults, log) => {
  //   logResults.push(log.evaluation_result);
  //   return logResults;
  // }, []);

  if (
    task?.ui_requirement?.outputs?.data?.length > 0
    // ||
    // (results.length > 0 && results.find((result) => result))
  ) {
    return "green";
  }

  if (
    task?.ui_requirement?.outputError
    // ||
    // (results.length > 0 && results.findIndex((result) => result) === -1)
  ) {
    return "red";
  }
}

export default handleTaskBorderColor;
