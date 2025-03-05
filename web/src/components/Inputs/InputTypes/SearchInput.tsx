import { SearchRounded } from "@mui/icons-material";
import CustomInput from "../CustomInput.tsx";
import { InputTypes } from "../../../types/index.ts";
import { HandleInputRenderType } from "../HandleInputRender";

function SearchInput(props: Omit<HandleInputRenderType, "inputType">) {
  return (
    <div className="flex w-full h-full">
      <div
        className={`bg-gray-200 dark:bg-gray-800 rounded-l flex shrink-0 items-center justify-center p-1 border dark:border-gray-700 text-gray-500 dark:text-gray-500`}>
        <SearchRounded />
      </div>
      <CustomInput
        type="search"
        placeholder="Search playbooks..."
        inputType={InputTypes.TEXT}
        {...props}
        className={`${props.className} !rounded-none !rounded-r !border-l-0 flex-1`}
        containerClassName="!w-full"
      />
    </div>
  );
}

export default SearchInput;
