import React, { MouseEvent } from "react";
import InfoRender from "./InfoRender.tsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import handleStepInformation from "../../../utils/playbook/stepInformation/handleStepInformation.ts";
import { Link, Notes } from "@mui/icons-material";
import getNestedValue from "../../../utils/getNestedValue.ts";
import DeleteTaskButton from "../../Buttons/DeleteTaskButton/index.tsx";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

type TaskInformationPropTypes = {
  taskId: string | undefined;
};

function TaskInformation({ taskId }: TaskInformationPropTypes) {
  const [task, , taskType] = useCurrentTask(taskId);
  const step = useCurrentStep(task?.ui_requirement.stepId);

  const handleNoAction = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  if (!task?.id) return;

  const taskData =
    task[task.source.toLowerCase() ?? ""][taskType?.toLowerCase()];

  return (
    <div
      className={`px-4 py-2 bg-white border-2 border-stone-400 w-[300px] h-auto cursor-pointer transition-all hover:shadow-violet-500 flex justify-between`}>
      <div className="flex flex-col gap-2 flex-1 text-ellipsis overflow-hidden">
        {handleStepInformation(task.id).map((info, i) => (
          <div className="flex flex-col flex-1 text-ellipsis" key={i}>
            {getNestedValue(taskData, info.key) && (
              <>
                <p className="text-xs font-semibold">{info.label}</p>
                <InfoRender info={info} taskId={task?.id ?? ""} />
              </>
            )}
          </div>
        ))}

        {task.notes && (
          <div className="flex gap-1 items-center flex-wrap">
            <Notes fontSize="small" />
            <p className="line-clamp-2 text-xs">{task.notes}</p>
          </div>
        )}

        {/* {(step?.external_links?.length ?? 0) > 0 && (
          <div className="flex gap-2 items-center flex-wrap">
            <Link fontSize="small" />
            {step?.external_links?.map((link) => (
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="line-clamp-2 text-xs text-violet-500 underline"
                onClick={handleNoAction}>
                {link.name || link.url}
              </a>
            ))}
          </div>
        )} */}
      </div>
      <div className="flex-[0.1] self-end">
        <DeleteTaskButton taskId={task.id} />
      </div>
    </div>
  );
}

export default TaskInformation;
