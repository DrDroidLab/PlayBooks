import React, { useEffect, useRef } from "react";
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

hljs.registerLanguage("python", python as any);
hljs.registerLanguage("json", json as any);
const key = "transformer_code";
const exampleInputKey = "ui_requirement.example_input";

function HandleResultTransformer({ id }) {
  const [task] = useCurrentTask(id);
  const code = getNestedValue(task, key) ?? "";
  const exampleInput = getNestedValue(task, exampleInputKey) ?? "";
  const dispatch = useDispatch();
  const outputRef = useRef<HTMLDivElement>(null);

  const testCode = async () => {
    try {
      // await triggerTestTransformer().unwrap();
      dispatch(
        showSnackbar({
          message: "Test connection successful",
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

  const setExampleInput = (value: string) => {
    updateCardById(exampleInputKey, value, id);
  };

  return (
    <div className="my-2 flex flex-col gap-2">
      <CodeAccordion
        code={code}
        label="Transformer (Write a python function returning a dict, the input is the trigger json payload)"
        language={LanguageTypes.PYTHON}
        onValueChange={setCode}
      />

      <CodeAccordion
        code={exampleInput}
        label={"Test your python function against a sample json payload"}
        language={LanguageTypes.JSON}
        onValueChange={setExampleInput}>
        {false && (
          <CodeAccordion
            ref={outputRef}
            code={""}
            label="Output"
            language={LanguageTypes.JSON}
            className="max-h-[150px] !overflow-y-auto"
            disabled={true}
            defaultOpen={true}
          />
        )}
        <CustomButton className="w-fit" onClick={testCode}>
          Test Code
        </CustomButton>
      </CodeAccordion>
    </div>
  );
}

export default HandleResultTransformer;
