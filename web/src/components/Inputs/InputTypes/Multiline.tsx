import React, { ChangeEvent } from "react";

type MultilineInputType = {
  label?: string;
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
  ...props
}: MultilineInputType) {
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    handleChange(value);
  };

  return (
    <textarea
      className={
        "w-full border border-gray-300 p-1 rounded text-sm resize-none text-[#676666] h-32"
      }
      rows={4}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={error ? { borderColor: "red" } : {}}
      placeholder={`Enter ${label}`}
      {...props}
    />
  );
}

export default Multiline;
