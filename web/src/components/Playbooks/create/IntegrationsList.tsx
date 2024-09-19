/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { usePlaybookBuilderOptionsQuery } from "../../../store/features/playbook/api/index.ts";
import IntegrationOption from "./IntegrationOption";
import useDebounce from "../../../hooks/common/useDebounce.ts";

function IntegrationsList() {
  const { data, isLoading } = usePlaybookBuilderOptionsQuery();
  const supportedTaskTypes = data?.supportedTaskTypes;
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(supportedTaskTypes || []);
  const queryString = useDebounce(query, 250);

  const search = () => {
    if (!query) {
      setItems([]);
    }
    const queryStr = queryString.toLowerCase();
    const filteredItems = supportedTaskTypes?.filter(
      (item) =>
        item?.source?.toLowerCase().includes(queryStr) ||
        item?.display_name?.toLowerCase().includes(queryStr) ||
        item?.task_type?.toLowerCase().includes(queryStr) ||
        item?.result_type?.toLowerCase().includes(queryStr) ||
        item?.category?.toLowerCase().includes(queryStr) ||
        (item?.form_fields ?? []).some(
          (f: any) =>
            f?.key_name?.toLowerCase().includes(queryStr) ||
            f?.display_name?.toLowerCase().includes(queryStr),
        ),
    );
    setItems(filteredItems || []);
  };

  const integrationGroups = supportedTaskTypes?.reduce((groups, item) => {
    const category = item.category ?? "Others";
    const group = groups[category];
    if (group) {
      group.options.push(item);
    } else {
      groups[category] = {
        category: category,
        options: [item],
      };
    }
    return groups;
  }, {});

  useEffect(() => {
    if (queryString) {
      search();
    }
  }, [queryString]);

  return (
    <div className="flex flex-col">
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
      {isLoading && (
        <div className="flex items-center gap-4 text-sm">
          <CircularProgress color="primary" size={20} />
          Looking for integrations...
        </div>
      )}
      <div className="flex flex-col gap-4 flex-1 pb-40">
        {query ? (
          items.length === 0 ? (
            <p className="text-sm">No integrations found.</p>
          ) : (
            items.map((option, index) => {
              return <IntegrationOption key={index} option={option} />;
            })
          )
        ) : (
          Object.keys(integrationGroups ?? {})?.map((group) => (
            <div key={group}>
              <p className="font-bold text-sm mb-1">{group}</p>
              <div className="flex flex-col gap-2">
                {integrationGroups[group].options.length === 0 && (
                  <p className="text-xs">No integrations yet.</p>
                )}
                {integrationGroups[group].options.map((option, index) => (
                  <IntegrationOption key={index} option={option} />
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
