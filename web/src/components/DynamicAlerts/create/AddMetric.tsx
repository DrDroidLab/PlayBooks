import AddSource from "./AddSource";

function AddMetric() {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold text-violet-500 text-sm">Metric</p>
      <AddSource />
    </div>
  );
}

export default AddMetric;
