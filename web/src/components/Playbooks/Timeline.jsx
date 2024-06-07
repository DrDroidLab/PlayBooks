import React from "react";
import { useGetPlaybookExecutionQuery } from "../../store/features/playbook/api/index.ts";

function Timeline() {
  const { data } = useGetPlaybookExecutionQuery(undefined, {
    forceRefetch: true,
  });

  console.log(data);
  return (
    <main className="p-2 min-h-screen">
      <div className="border-b p-2 sticky top-1 mb-2 bg-white">
        <h1 className="font-bold text-xl">Timeline</h1>
      </div>

      {data?.length > 0 && <p>No steps executed in the playbook yet</p>}
    </main>
  );
}

export default Timeline;
