import CustomInput from "../../../Inputs/CustomInput";

export default function OptionRender({ data }) {
  const value = "";

  const handleAddClick = () => {};

  const error = false;

  return (
    <CustomInput
      {...data}
      error={error}
      handleChange={() => {}}
      handleAddClick={handleAddClick}
      value={value ?? data.value}
    />
  );
}
