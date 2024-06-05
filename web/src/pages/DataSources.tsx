import React, { useEffect, useState } from "react";
import Heading from "../components/Heading";
import SuspenseLoader from "../components/Skeleton/SuspenseLoader";
import TableSkeleton from "../components/Skeleton/TableLoader";
import { useGetConnectorListQuery } from "../store/features/integrations/api/index.ts";
import { Add, SearchRounded } from "@mui/icons-material";
import ConnectorCard from "../components/Integration/ConnectorCard.tsx";
import { Link } from "react-router-dom";
import useDebounce from "../hooks/useDebounce.ts";

function DataSources() {
  const { data: integrations, isFetching } = useGetConnectorListQuery();
  const connectorList = integrations?.connectedConnectors;
  const [query, setQuery] = useState("");
  const [filteredIntegrations, setFilteredIntegrations] =
    useState(connectorList);
  const debouncedQuery = useDebounce(query, 0);
  const isEmpty = connectorList?.length === 0;
  const notFound = filteredIntegrations?.length === 0;

  const searchIntegrations = () => {
    if (debouncedQuery) {
      return connectorList?.filter(
        (connector) =>
          connector.title
            .toLowerCase()
            .includes(debouncedQuery.toLowerCase()) ||
          connector.enum.toLowerCase().includes(debouncedQuery.toLowerCase()),
      );
    } else {
      return connectorList;
    }
  };

  useEffect(() => {
    setFilteredIntegrations(searchIntegrations());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, connectorList]);

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
              placeholder="Search by name or type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {!isEmpty && <AddNewDataSource />}
        </div>
        <div className="mt-4 flex flex-col gap-1 bg-white p-2 rounded">
          <SuspenseLoader
            loading={isFetching}
            loader={<TableSkeleton noOfLines={7} />}>
            {filteredIntegrations?.map((connector, i) => (
              <ConnectorCard connector={connector} />
            ))}

            {isEmpty && (
              <div className="flex flex-col gap-2 items-center justify-center">
                <p className="text-sm">
                  No Datasources found. Connect a new one
                </p>
                <AddNewDataSource />
              </div>
            )}

            {!isEmpty && notFound && (
              <div className="flex flex-col gap-2 items-center justify-center">
                <p className="text-sm">
                  No Datasources found. try changing the search keyword
                </p>
              </div>
            )}
          </SuspenseLoader>
        </div>
      </main>
    </>
  );
}

export default DataSources;

function AddNewDataSource() {
  return (
    <Link
      to={"/data-sources/add"}
      className="flex gap-1 text-center justify-center w-fit items-center text-sm bg-white hover:bg-violet-500 text-violet-500 hover:text-white rounded p-1 border border-violet-500 shrink-0 font-medium transition-all">
      <Add fontSize="inherit" />
      <span>Add a new Data Source</span>
    </Link>
  );
}
