import React from "react";
import { useGetTemplatesQuery } from "../../../store/features/templates/api/index.ts";
import Loading from "../../common/Loading/index.tsx";
import { useDispatch } from "react-redux";
import { copyPlaybook } from "../../../store/features/playbook/playbookSlice.ts";

function TemplatesList() {
  const { data: templates, isLoading } = useGetTemplatesQuery();
  const dispatch = useDispatch();

  const handleImportTemplate = (template) => {
    dispatch(copyPlaybook(template));
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full p-2">
      <h1 className="font-bold text-xl">View Templates</h1>

      <div className="flex flex-wrap mt-4 gap-2">
        {(!templates || templates?.length === 0) && (
          <p className="text-sm text-gray-500">No templates found.</p>
        )}
        {templates?.map((template, index) => (
          <div
            key={index}
            onClick={handleImportTemplate}
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
