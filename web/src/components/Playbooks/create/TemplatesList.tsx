import React from "react";
import { useGetTemplatesQuery } from "../../../store/features/templates/api/index.ts";
import Loading from "../../common/Loading/index.tsx";
import { useDispatch } from "react-redux";
import { copyPlaybook } from "../../../store/features/playbook/playbookSlice.ts";
import useDrawerState from "../../../hooks/common/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import { Playbook, Step } from "../../../types/index.ts";
import generateUUIDWithoutHyphens from "../../../utils/common/generateUUIDWithoutHyphens.ts";
import { v4 as uuidv4 } from "uuid";

function TemplatesList() {
  const { toggle } = useDrawerState(DrawerTypes.TEMPLATES);
  const { data: templates, isLoading } = useGetTemplatesQuery();
  const dispatch = useDispatch();

  const handleImportTemplate = (template: Playbook) => {
    const steps: Step[] = template.steps.map((step: Step) => ({
      ...step,
      id: generateUUIDWithoutHyphens(),
      reference_id: uuidv4(),
      tasks: [],
      ui_requirement: {
        isOpen: false,
        showError: false,
      },
    }));
    const pb: Playbook = {
      ...template,
      steps,
      step_relations: [],
      ui_requirement: {
        isExisting: false,
        tasks: [],
      },
      global_variable_set: {},
    };
    dispatch(copyPlaybook({ pb, isTemplate: true }));
    toggle();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full p-2">
      <h1 className="font-bold text-xl sticky top-0 bg-white z-10 p-2">
        View Templates
      </h1>

      <div className="flex flex-wrap mt-4 gap-2 mb-40 overflow-scroll">
        {(!templates || templates?.length === 0) && (
          <p className="text-sm text-gray-500">No templates found.</p>
        )}
        {templates?.map((template, index) => (
          <div
            key={index}
            onClick={() => handleImportTemplate(template)}
            className="border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-all">
            <h3 className="font-bold text-md">{template.name}</h3>
            <p className="text-sm text-gray-500">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplatesList;
