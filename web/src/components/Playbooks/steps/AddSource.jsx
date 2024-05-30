import SelectTaskType from "./SelectTaskType.jsx";
import SelectSource from "./SelectSource.jsx";
import SelectConnectorOption from "./SelectConnectorOption.jsx";

function AddSource() {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex mt-2 gap-2">
        <div className="flex items-center gap-2">
          <SelectSource />
          <SelectTaskType />
        </div>
      </div>
      <div className="flex gap-2">
        <SelectConnectorOption />
      </div>
    </div>
  );
}

export default AddSource;
