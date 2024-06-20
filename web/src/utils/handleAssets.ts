import getCurrentTask from "./getCurrentTask.ts";

export default function handleAssets(data, connector_type, id: string) {
  const [task] = getCurrentTask(id);
  const source = connector_type.toLowerCase();

  switch (source) {
    case "bash":
      return data[0]?.remote_server.assets?.map((e) => e.ssh_server);
    default:
      return data[0][source].assets?.map(
        (e) => e[task.modelType.toLowerCase()],
      );
  }
}
