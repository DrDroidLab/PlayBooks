import useCurrentStep from "./useCurrentStep.ts";

export default function useStepDetails() {
  const [step] = useCurrentStep();

  const source = step?.tasks[0]?.source;
  const taskType =
    step?.tasks[0]?.[step?.tasks[0]?.source?.toLowerCase()]?.type;
  const taskConnectorSources = step?.tasks[0]?.task_connector_sources;

  return { source, taskType, taskConnectorSources };
}
