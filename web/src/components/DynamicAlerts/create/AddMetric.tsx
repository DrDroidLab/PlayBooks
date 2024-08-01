import AddSource from "./AddSource";
import Details from "./metric/Details";

function AddMetric() {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold text-violet-500 text-sm">Metric</p>
      <AddSource />
      <Details />
    </div>
  );
}

export default AddMetric;
