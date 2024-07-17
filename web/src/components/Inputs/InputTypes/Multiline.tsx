import React, { ChangeEvent } from "react";

type MultilineInputType = {
  label: string;
  value: string;
  handleChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
};

function Multiline({
  label,
  value,
  handleChange,
  disabled,
  error,
}: MultilineInputType) {
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleChange(value);
  };

  return (
    <div className="flex flex-col w-full">
      <p className="mt-2 text-sm text-gray-500">
        <b>{label}</b>
      </p>
      <textarea
        className={
          "w-full border border-gray-300 p-1 rounded mt-1 text-sm resize-none text-[#676666] h-32"
        }
        rows={4}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={error ? { borderColor: "red" } : {}}
      />
    </div>
  );
}

export default Multiline;
