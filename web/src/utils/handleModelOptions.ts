export default function handleModelOptions(modelOptions, modelType) {
  switch (modelType) {
    case "bash":
      return modelOptions.ssh_server_model_options;
    default:
      return modelOptions[`${modelType.toLowerCase()}_model_options`];
  }
}
