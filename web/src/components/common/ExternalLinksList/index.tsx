import { Launch } from "@mui/icons-material";
import useCurrentStep from "../../../hooks/playbooks/step/useCurrentStep";

function ExternalLinksList({ id }) {
  const [step] = useCurrentStep(id);

  if (!step || step?.external_links?.length === 0) return <></>;

  return (
    <div className="flex flex-wrap gap-3 items-center my-1">
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
