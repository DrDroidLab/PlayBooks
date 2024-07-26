import Heading from "../../components/Heading.js";
import { useGetConnectorListQuery } from "../../store/features/integrations/api/index.ts";
import BasicSearch from "../../components/common/BasicSearch/index.tsx";
import useBasicSearch from "../../hooks/useBasicSearch.ts";
import IntegrationCard from "../../components/common/IntegrationCard/index.jsx";
import GroupedIntegrations from "../../components/Integration/GroupedIntegrations.tsx";

function AddIntegration() {
  const { data: integrations } = useGetConnectorListQuery();
  const { query, setValue, filteredList, notFound } = useBasicSearch(
    integrations?.integrations?.allAvailableConnectors ?? [],
    ["title", "desc"],
  );

  return (
    <>
      <Heading heading={"Add an Integration"} />
      <div className="m-4">
        <BasicSearch query={query} setValue={setValue} />
      </div>
      {query ? (
        <div className="flex flex-wrap">
          {notFound && (
            <p className="mx-4 text-sm">
              No Integrations found. Try changing the search query.
            </p>
          )}
          {filteredList.map((e, index) => (
            <IntegrationCard key={index} data={e} />
          ))}
        </div>
      ) : (
        <GroupedIntegrations />
      )}
    </>
  );
}

export default AddIntegration;
