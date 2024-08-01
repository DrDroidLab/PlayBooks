import { constructBuilder } from "../../../../utils/dynamicAlerts/constructTaskBuilder";
import OptionRender from "./OptionRender";

function Details() {
  const data: any = constructBuilder();

  return (
    <div className="relative mt-2 flex flex-col gap-2">
      {data?.map((value, index) => (
        <div key={`data-${index}`} className={`flex gap-2 flex-wrap flex-col`}>
          <div
            key={`data-step-${index}`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "flex-start",
              flexWrap: "wrap",
              width: "100%",
              justifyContent: "flex-start",
              maxWidth: "600px",
            }}>
            <OptionRender data={value} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Details;
