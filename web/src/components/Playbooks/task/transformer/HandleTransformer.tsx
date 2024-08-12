import { useRef } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import json from "highlight.js/lib/languages/json";
import { useDispatch } from "react-redux";
import useCurrentTask from "../../../../hooks/playbooks/task/useCurrentTask";
import getNestedValue from "../../../../utils/common/getNestedValue";
import { showSnackbar } from "../../../../store/features/snackbar/snackbarSlice";
import { updateCardById } from "../../../../utils/execution/updateCardById";
import CodeAccordion from "../../../common/CodeAccordion";
import { LanguageTypes } from "../../../common/CodeAccordion/types";
import CustomButton from "../../../common/CustomButton";
import { useTestTransformerPlaybooksMutation } from "../../../../store/features/playbook/api";
import { defaultCodeTransformer } from "../../../../utils/common/transformerDefaults";

hljs.registerLanguage("python", python as any);
hljs.registerLanguage("json", json as any);
const key =
  "execution_configuration.result_transformer_lambda_function.definition";

function HandleResultTransformer({ id }) {
  const [task] = useCurrentTask(id);
  const code = getNestedValue(task, key) ?? "";
  const dispatch = useDispatch();
  const outputRef = useRef<HTMLDivElement>(null);
  const [triggerTestTransformer, { isLoading, data }] =
    useTestTransformerPlaybooksMutation();
  const taskOutput = task?.ui_requirement.outputs?.[0]?.data ?? "";

  const testCode = async () => {
    if (isLoading) return;
    try {
      await triggerTestTransformer({
        transformerCode: code,
        payload: task?.ui_requirement.outputs?.[0]?.data ?? "{}",
      }).unwrap();
      dispatch(
        showSnackbar({
          message: "Tranformer function test successful",
          type: "success",
        }),
      );
      outputRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    } catch (e: any) {
      dispatch(
        showSnackbar({
          message: e.message ?? "There was an error testing the transformer",
          type: "error",
        }),
      );
    }
  };

  const setCode = (value: string) => {
    updateCardById(key, value, id);
  };

  return (
    <div className="my-2 flex flex-col gap-2">
      <CodeAccordion
        code={code}
        label={
          <>
            Transformer Function{" "}
            <a
              href="https://docs.drdroid.io/docs/output-exporter-transformers"
              target="_blank"
              rel="noreferrer"
              className="hover:underline">
              (See how it works)
            </a>
          </>
        }
        placeholder={defaultCodeTransformer}
        language={LanguageTypes.PYTHON}
        onValueChange={setCode}
        className="min-h-[100px]"
        defaultOpen={true}
      />

      <CodeAccordion
        code={taskOutput}
        placeholder="Run the task to generate the output json"
        className="max-h-[150px] !overflow-y-auto"
        disabled={true}
        label={"Test your transformer against an output json"}
        language={LanguageTypes.JSON}>
        {data && (
          <CodeAccordion
            ref={outputRef}
            code={data}
            label="Output"
            language={LanguageTypes.JSON}
            className="max-h-[150px] !overflow-y-auto"
            disabled={true}
            defaultOpen={true}
          />
        )}
        {taskOutput && (
          <CustomButton
            disabled={isLoading}
            className="w-fit"
            onClick={testCode}>
            {isLoading ? "Loading..." : "Test Code"}
          </CustomButton>
        )}
      </CodeAccordion>
    </div>
  );
}

export default HandleResultTransformer;
