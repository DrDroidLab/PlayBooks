import getCurrentTask from "./getCurrentTask.ts";

export default function handleAssets(data, id: string) {
  const [task] = getCurrentTask(id);
  const source = task?.source?.toLowerCase() ?? "";

  switch (source) {
    case "bash":
      return data[0]?.remote_server.assets?.map((e) => e.ssh_server);
    default:
      return data[0][source].assets?.map(
        (e) => e[task?.ui_requirement.model_type?.toLowerCase() ?? ""],
      );
  }
}
