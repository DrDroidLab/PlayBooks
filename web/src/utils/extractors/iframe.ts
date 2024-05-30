export const extractIframeTasks = (step: any) => {
    let stepSource = "DOCUMENTATION";
    let modelType = "IFRAME";
    let selected = "DOCUMENTATION";
    const tasks = step.tasks;
    const iframeTask = tasks[0].documentation_task;
  
    const stepData = {
      source: 'DOCUMENTATION', //stepSource,
      selectedSource: selected,
      connector_type: stepSource,
      model_type: modelType,
      modelType,
      iframe_url: iframeTask.iframe_url,
    };

    console.log('stepData', stepData);
  
    return stepData;
  };
  