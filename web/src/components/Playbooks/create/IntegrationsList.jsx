/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useGetConnectorTypesQuery } from "../../../store/features/playbook/api/index.ts";
import {
  integrationSentenceMap,
  integrations,
} from "../../../utils/integrationGroupList.ts";
import IntegrationOption from "./IntegrationOption.jsx";

function IntegrationsList({ setIsOpen }) {
  const { data: connectorData, isFetching: connectorLoading } =
    useGetConnectorTypesQuery();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(connectorData || []);

  const search = (e) => {
    if (!query) {
      setItems([]);
    }
    const filteredItems = connectorData?.filter(
      (item) =>
        item?.connector_type?.toLowerCase().includes(query) ||
        item?.display_name?.toLowerCase().includes(query) ||
        integrationSentenceMap[item.model_type]?.toLowerCase().includes(query),
    );
    setItems(filteredItems || []);
  };

  const integrationGroups = integrations.map((group) => ({
    ...group,
    options: group.options
      .map((modelType) => {
        const item = connectorData?.find(
          (item) => item.model_type === modelType,
        );
        return item
          ? {
              ...item,
              label: integrationSentenceMap[modelType],
              model_type: modelType,
            }
          : { label: integrationSentenceMap[modelType], model_type: modelType };
      })
      .filter((option) => option !== null),
  }));

  useEffect(() => {
    if (query) {
      search();
    }
  }, [query]);

  return (
    <div>
      <div className="sticky top-0 bg-white z-10">
        <h2 className="mt-4 font-bold text-sm">Add Data</h2>
        <input
          type="search"
          className="w-full p-2 border-[1px] border-gray-200 rounded text-sm my-2 outline-violet-500"
          placeholder="Search for integrations..."
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
      </div>
      {connectorLoading && (
        <div className="flex items-center gap-4 text-sm">
          <CircularProgress color="primary" size={20} />
          Looking for integrations...
        </div>
      )}
      <div className="flex flex-col gap-4 h-screen">
        {query ? (
          items.length === 0 ? (
            <p className="text-sm">No integrations found.</p>
          ) : (
            items.map((option, index) => (
              <IntegrationOption
                key={index}
                option={option}
                setIsOpen={setIsOpen}
              />
            ))
          )
        ) : (
          integrationGroups.map((group) => (
            <div key={group.id}>
              <p className="font-bold text-sm mb-1">{group.label}</p>
              <div className="flex flex-col gap-2">
                {group.options.length === 0 && (
                  <p className="text-xs">No integrations yet.</p>
                )}
                {group.options.map((option, index) => (
                  <IntegrationOption
                    key={index}
                    option={option}
                    setIsOpen={setIsOpen}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default IntegrationsList;
