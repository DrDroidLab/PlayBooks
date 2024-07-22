import React, { useRef } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import json from "highlight.js/lib/languages/json";
import { useDispatch, useSelector } from "react-redux";
import {
  currentWorkflowSelector,
  setCurrentWorkflowKey,
} from "../../../store/features/workflow/workflowSlice.ts";
import CustomButton from "../../common/CustomButton/index.tsx";
import { useTestTransformerMutation } from "../../../store/features/workflow/api/testTransformerApi.ts";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice.ts";
import CodeAccordion from "../../common/CodeAccordion/index.tsx";
import { LanguageTypes } from "../../common/CodeAccordion/types/index.ts";

hljs.registerLanguage("python", python as any);
hljs.registerLanguage("json", json as any);
const key = "transformerCode";
const exampleInputKey = "exampleInput";

function HandleTransformer() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const code = currentWorkflow[key];
  const exampleInput = currentWorkflow[exampleInputKey];
  const dispatch = useDispatch();
  const [triggerTestTransformer, { isLoading, data }] =
    useTestTransformerMutation();
  const outputRef = useRef<HTMLDivElement>(null);

  const testCode = async () => {
    if (isLoading) return;
    await triggerTestTransformer().unwrap();
    dispatch(
      showSnackbar({
        message: "Test connection successful",
        type: "success",
      }),
    );
    outputRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const setCode = (value: string) => {
    dispatch(setCurrentWorkflowKey({ key, value }));
  };

  const setExampleInput = (value: string) => {
    dispatch(setCurrentWorkflowKey({ key: exampleInputKey, value }));
  };

  return (
    <div className="my-2 flex flex-col gap-2">
      <CodeAccordion
        code={code}
        label="Transformer (Write a python function returning a dict)"
        language={LanguageTypes.PYTHON}
        onValueChange={setCode}
      />

      <CodeAccordion
        code={exampleInput}
        label="Example Input for testing your function"
        language={LanguageTypes.JSON}
        onValueChange={setExampleInput}
      />

      {data && (
        <CodeAccordion
          ref={outputRef}
          code={data?.event_context}
          label="Output"
          language={LanguageTypes.JSON}
          className="max-h-[150px] !overflow-y-auto"
          disabled={true}
        />
      )}

      <CustomButton className="w-fit" onClick={testCode}>
        {isLoading ? "Loading..." : "Test Code"}
      </CustomButton>
    </div>
  );
}

export default HandleTransformer;
