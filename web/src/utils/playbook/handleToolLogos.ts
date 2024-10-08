import { SOURCES } from "../../constants/index.ts";
import { cardsData } from "../common/cardsData.ts";

const handleImageSrc = (
  source: string,
  model_type: string,
  task_type: string,
) => {
  switch (source) {
    case SOURCES.TEXT:
      if (task_type === SOURCES.IFRAME) {
        return cardsData.find((e) => e.enum === SOURCES.IFRAME)?.url;
      } else {
        return (
          cardsData.find((e) => e.enum === source?.replace("_VPC", ""))?.url ??
          cardsData.find((e) => model_type?.includes(e.enum))?.url
        );
      }
    default:
      return (
        cardsData.find((e) => e.enum === source?.replace("_VPC", ""))?.url ??
        cardsData.find((e) => model_type?.includes(e.enum))?.url
      );
  }
};

export default function handleToolLogos(playbook) {
  const steps = playbook.steps;

  const tools = steps?.reduce((tools, step) => {
    const task = step.tasks[0];
    const image = handleImageSrc(task.source, task.modelType, task.taskType);

    if (tools.findIndex((e) => e.image === image) !== -1) {
      return tools;
    }

    return [
      ...tools,
      {
        image,
        name: task.source,
      },
    ];
  }, []);

  return tools ?? [];
}
