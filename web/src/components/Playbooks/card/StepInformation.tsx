import React from "react";
import InfoRender from "./InfoRender.tsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import handleStepInformation from "../../../utils/playbook/stepInformation/handleStepInformation.ts";
import { useSelector } from "react-redux";
import { playbookSelector } from "../../../store/features/playbook/playbookSlice.ts";
import { Link, Notes } from "@mui/icons-material";
import DeleteStepButton from "../../Buttons/DeleteStepButton/index.tsx";
import getNestedValue from "../../../utils/getNestedValue.ts";

type StepInformationPropTypes = {
  stepId: string;
};

function StepInformation({ stepId }: StepInformationPropTypes) {
  const [step] = useCurrentStep(stepId);
  const { currentStepId } = useSelector(playbookSelector);

  if (!step.id) return;

  return (
    <div
      className={`${
        currentStepId === step.id.toString() ? "shadow-violet-500" : ""
      } px-4 py-2 bg-white border-2 border-stone-400 w-[300px] h-auto cursor-pointer transition-all hover:shadow-violet-500 flex justify-between`}>
      <div className="flex flex-col gap-2">
        {handleStepInformation(step.id).map((info, i) => (
          <div className="flex flex-col" key={i}>
            {getNestedValue(step, info.key) && (
              <>
                <p className="text-xs font-semibold">{info.label}</p>
                <InfoRender info={info} stepId={step.id} />
              </>
            )}
          </div>
        ))}

        {step.notes && (
          <div className="flex gap-1 items-center">
            <Notes fontSize="small" />
            <p className="line-clamp-2 text-xs">{step.notes}</p>
          </div>
        )}

        {step?.externalLinks?.length > 0 && (
          <div className="flex gap-2 items-center">
            <Link fontSize="small" />
            {step.externalLinks?.map((link) => (
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="line-clamp-2 text-xs text-violet-500 underline">
                {link.name || link.url}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="flex-[0.1] self-end">
        <DeleteStepButton stepId={step.id} />
      </div>
    </div>
  );
}

export default StepInformation;