import { Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import { renderTimestamp } from "../../../utils/common/dateUtils";
import handleToolLogos from "../../../utils/playbook/handleToolLogos";

export const usePlaybookExecutionsData = (data: any[]) => {
  const rows = data?.map((item: any) => ({
    runId: (
      <Link
        to={`/playbooks/${item.playbook.id}?executionId=${item.playbook_run_id}`}
        className="text-violet-500 hover:text-violet-800 transition-all">
        {item.playbook_run_id}
      </Link>
    ),
    playbook: (
      <Link
        to={`/playbooks/${item.playbook.id}`}
        className="text-violet-500 hover:text-violet-800 transition-all">
        {item.playbook?.name}
      </Link>
    ),
    tools: (
      <div className="flex gap-1 items-center">
        {handleToolLogos(item.playbook).map((tool: any) => (
          <Tooltip key={tool.name} title={tool.name}>
            <img src={tool.image} alt={tool.name} width={25} height={25} />
          </Tooltip>
        ))}
      </div>
    ),
    executedAt:
      item.finished_at ?? item.created_at
        ? renderTimestamp(item.finished_at ?? item.created_at)
        : "--",
    executedBy: item.created_by ?? "--",
  }));

  return {
    rows,
  };
};

export default usePlaybookExecutionsData;
