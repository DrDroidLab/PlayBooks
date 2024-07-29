import React from "react";
import { useDispatch } from "react-redux";
import {
  addExternalLinks,
  toggleExternalLinkVisibility,
} from "../../../store/features/playbook/playbookSlice.ts";
import ExternalLinks from "./ExternalLinks.jsx";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched.ts";

function HandleExternalLinksRender({ id }) {
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();

  const [step] = useCurrentStep(id);

  const toggleExternalLinks = () => {
    dispatch(toggleExternalLinkVisibility({ id }));
  };

  const setLinks = (links) => {
    dispatch(addExternalLinks({ links, id }));
  };

  if (isPrefetched || !step) return;

  const showLinks =
    step?.ui_requirement.showExternalLinks ||
    (step?.external_links?.length ?? 0) > 0;

  return (
    <>
      {(step?.external_links?.length ?? 0) > 0 ? (
        <div className="mt-2 text-sm cursor-pointer text-violet-500">
          <b>External Links</b>
        </div>
      ) : (
        <div
          className="mt-2 text-sm cursor-pointer text-violet-500"
          onClick={toggleExternalLinks}>
          <b>{step?.ui_requirement.showExternalLinks ? "-" : "+"}</b> Add
          External Links
        </div>
      )}
      {showLinks && (
        <ExternalLinks links={step?.external_links} setLinks={setLinks} />
      )}
    </>
  );
}

export default HandleExternalLinksRender;
