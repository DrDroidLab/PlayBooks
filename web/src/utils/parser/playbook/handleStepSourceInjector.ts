import { SOURCES } from "../../../constants/index.ts";
import { PlaybookTask } from "../../../types.ts";
import * as Injector from "../../injectors/index.ts";
import { v4 as uuidv4 } from "uuid";
import stateToGlobalVariable from "./stateToGlobalVariable.ts";

export const handleStepSourceInjector = (step): PlaybookTask[] => {
  let baseTask: PlaybookTask = {
    name: step.name ?? uuidv4(),
    id: step.id ?? "0",
    source: step.source,
    description: step.description ?? "",
    interpreter_type: step.interpreter?.type,
    global_variable_set: stateToGlobalVariable(step.globalVariables),
    task_connector_sources: step.connectorType
      ? [
          {
            id: step.connectorType || 0,
          },
        ]
      : [],
  };

  let tasks: PlaybookTask[] = [];

  switch (step.source) {
    case SOURCES.CLOUDWATCH:
      tasks = Injector.injectCloudwatchTasks(step, baseTask);
      break;
    case SOURCES.GRAFANA_VPC:
    case SOURCES.GRAFANA:
      tasks = Injector.injectGrafanaTasks(step, baseTask);
      break;
    case SOURCES.GRAFANA_MIMIR:
      tasks = Injector.injectMimirTasks(step, baseTask);
      break;
    case SOURCES.CLICKHOUSE:
      tasks = Injector.injectClickhouseTasks(step, baseTask);
      break;
    case SOURCES.POSTGRES:
      tasks = Injector.injectPostgresTasks(step, baseTask);
      break;
    case SOURCES.EKS:
      tasks = Injector.injectEksTasks(step, baseTask);
      break;
    case SOURCES.NEW_RELIC:
      tasks = Injector.injectNewRelicTasks(step, baseTask);
      break;
    case SOURCES.DATADOG:
      tasks = Injector.injectDatadogTasks(step, baseTask);
      break;
    case SOURCES.API:
      tasks = Injector.injectApiTasks(step, baseTask);
      break;
    case SOURCES.TEXT:
      // Handling iframe also
      tasks = Injector.injectTextTasks(step, baseTask);
      break;
    case SOURCES.BASH:
      tasks = Injector.injectBashTasks(step, baseTask);
      break;
    case SOURCES.SQL_DATABASE_CONNECTION:
      tasks = Injector.injectSqlRawQueryTasks(step, baseTask);
      break;
    case SOURCES.AZURE:
      tasks = Injector.injectAzureLogTasks(step, baseTask);
      break;
    default:
      break;
  }

  const taskWithIds = tasks.map((task, i) => ({
    ...task,
    id: step.taskIds?.length > 0 ? step.taskIds[i] ?? step.id ?? "0" : "0",
  }));

  return taskWithIds;
};
