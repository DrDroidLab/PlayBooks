import React from "react";
import { useDispatch } from "react-redux";
import {
  addExternalLinks,
  toggleExternalLinkVisibility,
} from "../../../store/features/playbook/playbookSlice.ts";
import ExternalLinks from "./ExternalLinks.jsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function HandleExternalLinksRender({ id }) {
  const dispatch = useDispatch();

  const [step] = useCurrentStep(id);

  const toggleExternalLinks = () => {
    dispatch(toggleExternalLinkVisibility({ id }));
  };

  const setLinks = (links) => {
    dispatch(addExternalLinks({ links, id }));
  };

  return (
    <>
      <div
        className="mt-2 text-sm cursor-pointer text-violet-500"
        onClick={toggleExternalLinks}>
        <b>{step?.ui_requirement.showExternalLinks ? "-" : "+"}</b> Add External
        Links
      </div>
      {step?.ui_requirement.showExternalLinks && (
        <ExternalLinks links={step.external_links} setLinks={setLinks} />
      )}
    </>
  );
}

export default HandleExternalLinksRender;
