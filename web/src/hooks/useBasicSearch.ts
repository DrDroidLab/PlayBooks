import { useEffect, useState } from "react";
import useDebounce from "./useDebounce.ts";

function useBasicSearch(list: any[], searchKeys: string[]) {
  const [query, setQuery] = useState("");
  const [filteredList, setFilteredList] = useState(list);
  const debouncedQuery = useDebounce(query, 0);

  const isEmpty = list?.length === 0;
  const notFound = filteredList?.length === 0;

  const setValue = (e) => {
    if (!e) {
      setQuery("");
      return;
    }
    const val = e.target.value;
    setQuery(val);
  };

  const search = () => {
    if (debouncedQuery) {
      return list?.filter((item) => {
        const conditions = searchKeys.map((key) =>
          item[key].toLowerCase().includes(debouncedQuery.toLowerCase()),
        );
        return conditions.includes(true);
      });
    } else {
      return list;
    }
  };

  useEffect(() => {
    setFilteredList(search());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, list]);

  return {
    query,
    filteredList,
    list,
    isEmpty,
    notFound,
    setValue,
  };
}

export default useBasicSearch;
