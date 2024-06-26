import React, { MouseEvent, useEffect, useState } from "react";
import { useGetConnectedPlaybooksQuery } from "../../store/features/integrations/api/getConnectedPlaybooksApi.ts";

function AffectedPlaybooks({ id }) {
  const { isFetching, data } = useGetConnectedPlaybooksQuery(id);
  const [filteredData, setFilteredData] = useState([]);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setFilteredData(data);
  };

  const navigateToPlaybook = (e: MouseEvent<HTMLElement>, id: string) => {
    e.stopPropagation();
    window.open(`/playbooks/${id}`, "_blank");
  };

  useEffect(() => {
    if (data?.length > 0) {
      setFilteredData(data?.filter((_: any, i: number) => i < 5));
    }
  }, [data]);

  if (data?.length === 0) return;

  return (
    <div className="my-1">
      <p className="text-xs">
        Following Playbooks will be affected: ({data?.length})
      </p>
      {isFetching && <p className="text-xs">Loading...</p>}
      <div className="flex flex-wrap gap-2 my-1">
        {filteredData?.map((playbook: any) => (
          <div
            key={playbook.playbook_id}
            onClick={(e) => navigateToPlaybook(e, playbook.playbook_id)}
            className="bg-gray-200 p-1 text-xs rounded hover:bg-violet-500 hover:text-white !no-underline transition-all cursor-pointer">
            {playbook.playbook_name}
          </div>
        ))}
      </div>
      {filteredData?.length !== data?.length && (
        <p
          onClick={handleClick}
          className="text-xs text-violet-500 hover:underline cursor-pointer">
          See More
        </p>
      )}
    </div>
  );
}

export default AffectedPlaybooks;
