import { InputTypes } from "../../../types";
import CustomInput from "../../Inputs/CustomInput";
import { notificationOptions } from "./utils";

function AddNotification() {
  const handleSourceChange = (val: string) => {};

  const handleChannelsChange = (val: string) => {};

  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold text-violet-500 text-sm">Notification</p>
      <div className="flex items-center gap-1">
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          options={notificationOptions}
          value={""}
          placeholder={`Select Source`}
          handleChange={handleSourceChange}
          error={undefined}
        />
        <CustomInput
          inputType={InputTypes.TYPING_DROPDOWN_MULTIPLE_SELECTION}
          options={notificationOptions}
          value={[]}
          placeholder={`Select Channels`}
          handleChange={handleChannelsChange}
          error={undefined}
        />
      </div>
    </div>
  );
}

export default AddNotification;
