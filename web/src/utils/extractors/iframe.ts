export const extractIframeTasks = (step: any) => {
    let stepSource = "IFRAME";
    let modelType = "IFRAME";
    let selected = "IFRAME";
    const tasks = step.tasks;
    const iframeTask = tasks[0].iframe;
  
    const stepData = {
      source: stepSource,
      selectedSource: selected,
      connector_type: stepSource,
      model_type: modelType,
      modelType,
      iframe_url: iframeTask.iframe_url,
    };
  
    return stepData;
  };
  