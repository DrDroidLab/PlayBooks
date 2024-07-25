import { Add, Delete } from "@mui/icons-material";
import CustomButton from "../../common/CustomButton";
import CustomInput from "../CustomInput";
import { HandleInputRenderType } from "../HandleInputRender";
import { useState } from "react";
import extractOptions from "../../../utils/playbook/extractOptions";
import { KeyType } from "../../../utils/playbook/key";

function CompositeField(props: Omit<HandleInputRenderType, "inputType">) {
  if (!props.compositeFields) return null;
  const [data, setData] = useState(() => {
    if (!props.compositeFields) return [];
    const emptyFormData = props.compositeFields.reduce((val, field) => {
      if (!field.key) return val;
      val[field.key] = "";
      return val;
    }, {});
    return [emptyFormData];
  });

  const emptyFormData = props.compositeFields.reduce((val, field) => {
    if (!field.key) return val;
    val[field.key] = "";
    return val;
  }, {});

  const addData = () => {
    setData([...data, emptyFormData]);
  };

  const deleteData = (index: number) => {
    const newData = structuredClone(data);
    newData.splice(index, 1);
    setData(newData);
  };

  const handleChange = (value: string, index: number, key: string) => {
    const newData = data.map((item, i) =>
      i === index ? { ...item, [key]: value } : item,
    );
    setData(newData);
    if (props.handleChange) props.handleChange(JSON.stringify(newData));
  };

  const handleOptions = (field: HandleInputRenderType, index: number) => {
    const options = extractOptions(field.key as KeyType, undefined, index);
    if (options?.length > 0) {
      return options;
    }
    return field.options ?? [];
  };

  return (
    <div className="flex gap-1 rounded border p-1 flex-wrap !w-fit">
      <div className="flex flex-wrap items-end gap-2">
        {data.map((val, index) => (
          <div key={index} className="flex flex-wrap items-end gap-1">
            {props.compositeFields!.map((field) => (
              <CustomInput
                key={field.key}
                {...field}
                value={val[field.key!]}
                handleChange={(val) =>
                  handleChange(val as string, index, field.key!)
                }
                options={handleOptions(field, index)}
                className="!max-w-[100px]"
              />
            ))}
            {index > 0 && (
              <CustomButton onClick={() => deleteData(index)}>
                <Delete fontSize="small" />
              </CustomButton>
            )}
          </div>
        ))}
        <CustomButton onClick={addData}>
          <Add fontSize="small" />
        </CustomButton>
      </div>
    </div>
  );
}

export default CompositeField;
