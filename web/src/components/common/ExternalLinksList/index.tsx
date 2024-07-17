import React from "react";
import { Launch } from "@mui/icons-material";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function ExternalLinksList({ id }) {
  const [step] = useCurrentStep(id);

  if (!step) return <></>;

  return (
    <div className="flex flex-wrap gap-2 items-center my-2">
      {step.external_links?.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-wrap items-center text-sm gap-1 text-violet-500 hover:underline">
          {link?.name || link.url} <Launch />
        </a>
      ))}
    </div>
  );
}

export default ExternalLinksList;
