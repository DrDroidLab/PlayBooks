import CustomInput from "../CustomInput";
import { HandleInputRenderType } from "../HandleInputRender";

function CompositeField(props: Omit<HandleInputRenderType, "inputType">) {
  if (!props.compositeFields) return;

  return (
    <div className="flex gap-1 rounded border p-1 flex-wrap !w-fit">
      {props.compositeFields.map((field) => (
        <CustomInput {...field} className="!max-w-[100px]" />
      ))}
    </div>
  );
}

export default CompositeField;
