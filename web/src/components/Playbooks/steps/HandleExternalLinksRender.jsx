import React from "react";
import { useDispatch } from "react-redux";
import {
  addExternalLinks,
  toggleExternalLinkVisibility,
} from "../../../store/features/playbook/playbookSlice.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import ExternalLinks from "./ExternalLinks.jsx";

function HandleExternalLinksRender({ step, index }) {
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();

  const toggleExternalLinks = () => {
    dispatch(toggleExternalLinkVisibility({ index }));
  };

  const setLinks = (links) => {
    dispatch(addExternalLinks({ links, index }));
  };

  return (
    <div>
      {!isPrefetched && (
        <>
          <div
            className="mt-2 text-sm cursor-pointer text-violet-500"
            onClick={toggleExternalLinks}>
            <b>{step.showExternalLinks ? "-" : "+"}</b> Add External Links
          </div>
          {step.showExternalLinks && (
            <ExternalLinks links={step.externalLinks} setLinks={setLinks} />
          )}
        </>
      )}
    </div>
  );
}

export default HandleExternalLinksRender;
