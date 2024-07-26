import Heading from "../../components/Heading.tsx";
import SuspenseLoader from "../../components/Skeleton/SuspenseLoader.js";
import TableSkeleton from "../../components/Skeleton/TableLoader.js";
import { useGetConnectorListQuery } from "../../store/features/integrations/api/index.ts";
import { Add } from "@mui/icons-material";
import ConnectorCard from "../../components/Integration/ConnectorCard.tsx";
import { Link } from "react-router-dom";
import BasicSearch from "../../components/common/BasicSearch/index.tsx";
import useBasicSearch from "../../hooks/useBasicSearch.ts";

function DataSources() {
  const { data: integrations, isFetching } = useGetConnectorListQuery();
  const connectorList = integrations?.connectedConnectors ?? [];
  const { query, setValue, isEmpty, notFound, filteredList } = useBasicSearch(
    connectorList,
    ["title", "enum"],
  );

  return (
    <>
      <Heading
        heading={"Integrations"}
        subHeading={"View and manage your integrations"}
      />
      <main className="p-2">
        <div className="flex items-stretch gap-2">
          <BasicSearch query={query} setValue={setValue} />
          {!isEmpty && <AddNewDataSource />}
        </div>
        <div className="mt-4 flex flex-col gap-1 bg-white p-2 rounded">
          <SuspenseLoader
            loading={isFetching}
            loader={<TableSkeleton noOfLines={7} />}>
            {filteredList?.map((connector, i) => (
              <ConnectorCard connector={connector} />
            ))}

            {isEmpty && (
              <div className="flex flex-col gap-2 items-center justify-center">
                <p className="text-sm">
                  No Integrations found. Connect a new one
                </p>
                <AddNewDataSource />
              </div>
            )}

            {!isEmpty && notFound && (
              <div className="flex flex-col gap-2 items-center justify-center">
                <p className="text-sm">
                  No Integrations found. try changing the search keyword
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
      <span>New Integration</span>
    </Link>
  );
}
