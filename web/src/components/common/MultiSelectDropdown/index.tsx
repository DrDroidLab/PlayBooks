/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import SelectComponent from "../../SelectComponent";
import { CloseRounded } from "@mui/icons-material";

type MultiSelectDropdownProps = {
  label: string;
  options: any[];
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  selectedDisplayKey?: string;
  additionalProps?: any;
  multiSelectChange: (selected: any) => void;
  selectedValuesKey: string;
  task: any;
};

function MultiSelectDropdown({
  label,
  options,
  placeholder = "",
  disabled = false,
  error = null,
  selectedDisplayKey = "label",
  additionalProps,
  multiSelectChange,
  selectedValuesKey = "metric",
  task,
}: MultiSelectDropdownProps) {
  const [selected, setSelected] = useState<any>(task[selectedValuesKey] ?? []);
  const handleSelectChange = (id, val) => {
    const element = selected.findIndex((el) => el.id === id);
    let selectedList: any = [...selected];
    if (element === -1) {
      selectedList = [...selected, val];
      setSelected(selectedList);
    }
    multiSelectChange(selectedList);
  };

  const handleDelete = (val) => {
    let selectedList = selected.filter((el) => el.id !== val.id);
    setSelected(selectedList);
    multiSelectChange(selectedList);
  };

  useEffect(() => {
    if (selected.length !== task[selectedValuesKey]?.length)
      setSelected(task[selectedValuesKey] ?? []);
  }, [task[selectedValuesKey]]);

  return (
    <div className={`flex flex-col`}>
      <p
        style={{
          fontSize: "13px",
          color: "#676666",
        }}>
        <b>{label}</b>
      </p>
      {!disabled && (
        <SelectComponent
          data={options ?? []}
          placeholder={placeholder || `Select ${label}`}
          onSelectionChange={handleSelectChange}
          selected={null}
          searchable={true}
          disabled={disabled}
          error={error}
          containerClassName={"w-56"}
          {...additionalProps}
        />
      )}
      <div className="flex mt-2 gap-1 items-center flex-wrap">
        {selected?.map((e) => (
          <div className="flex items-center text-xs rounded p-1 bg-gray-100 cursor-pointer font-semibold">
            <span>{e[selectedDisplayKey]}</span>
            {!disabled && (
              <div onClick={() => handleDelete(e)}>
                <CloseRounded fontSize="small" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MultiSelectDropdown;
