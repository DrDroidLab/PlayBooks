import React from "react";
import Heading from "../components/Heading";
import SuspenseLoader from "../components/Skeleton/SuspenseLoader";
import TableSkeleton from "../components/Skeleton/TableLoader";
import { useGetConnectorListQuery } from "../store/features/integrations/api/index.ts";
import { Add, SearchRounded } from "@mui/icons-material";
import ConnectorCard from "../components/Integration/ConnectorCard.tsx";
import { Link } from "react-router-dom";

function DataSources() {
  const { data: integrations, isFetching } = useGetConnectorListQuery();

  return (
    <>
      <Heading
        heading={"Data Sources"}
        subHeading={"View and manage your data sources"}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
        children={<></>}
      />
      <main className="p-2">
        <div className="flex items-stretch gap-2">
          <div className="flex items-center bg-white w-full p-2 gap-2 border rounded">
            <SearchRounded />
            <input
              className="w-full h-full text-base outline-none"
              placeholder="Search by name"></input>
          </div>
          <Link
            to={"/integrations"}
            className="flex gap-1 items-center text-sm bg-white hover:bg-violet-500 text-violet-500 hover:text-white rounded p-1 border border-violet-500 shrink-0 font-medium transition-all">
            <Add fontSize="inherit" />
            <span>Add a new Data Source</span>
          </Link>
        </div>
        <div className="mt-4 flex flex-col gap-1 bg-white p-2 rounded">
          <SuspenseLoader
            loading={isFetching}
            loader={<TableSkeleton noOfLines={7} />}>
            {integrations?.connectedConnectors?.map((connector, i) => (
              <ConnectorCard connector={connector} />
            ))}
          </SuspenseLoader>
        </div>
      </main>
    </>
  );
}

export default DataSources;
