import { FilePresent } from "@mui/icons-material";
import { unsupportedInterpreterTypes } from "../../../utils/playbook/unsupportedInterpreterTypes";
import CustomButton from "../../common/CustomButton";
import Interpretation from "../../common/Interpretation";
import TaskOutput from "./TaskOutput";

function HandleTaskOutput({ showHeading, task, output }) {
  console.log("utut", output);
  return (
    <div
      className={`${
        !showHeading ? "max-h-full" : "max-h-[500px] overflow-hidden"
      } h-full bg-gray-50  flex flex-col items-stretch mr-0 justify-between lg:flex-row w-full gap-2 max-w-full`}>
      <div className="w-full">
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            {Object.entries(output?.execution_global_variable_set ?? {}).map(
              ([key, value]) => (
                <p className="text-xs my-1 flex items-center border-r pr-2">
                  <span className="bg-violet-100 rounded p-1">{key}</span> :{" "}
                  {value as string}
                </p>
              ),
            )}
          </div>
          {output?.interpretation?.object_url &&
            output?.interpretation.type === "CSV_FILE" && (
              <CustomButton onClick={() => {}} className="my-1">
                <a href={output?.interpretation?.object_url} download>
                  <FilePresent /> Export CSV
                </a>
              </CustomButton>
            )}
        </div>
        <TaskOutput
          showHeading={showHeading}
          id={task.id}
          task={task}
          output={output.data}
          error={output.error}
        />
      </div>
      {Object.keys(output?.interpretation ?? {}).length > 0 &&
        !unsupportedInterpreterTypes.includes(
          output?.interpretation?.interpreter_type,
        ) && (
          <div className="lg:w-2/5 w-full h-full">
            <Interpretation {...output.interpretation} />
          </div>
        )}
    </div>
  );
}

export default HandleTaskOutput;
