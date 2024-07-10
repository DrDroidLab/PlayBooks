import React from "react";
import Editor from "react-simple-code-editor";
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

hljs.registerLanguage("python", python as any);
hljs.registerLanguage("json", json as any);
const key = "transformerCode";
const exampleInputKey = "exampleInput";

function HandleTransformer() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const code = currentWorkflow[key];
  const exampleInput = currentWorkflow[exampleInputKey];
  const dispatch = useDispatch();
  const [triggerTestTransformer, { isLoading }] = useTestTransformerMutation();

  const testCode = () => {
    if (!isLoading) triggerTestTransformer();
  };

  const setCode = (value: string) => {
    dispatch(setCurrentWorkflowKey({ key, value }));
  };

  const setExampleInput = (value: string) => {
    dispatch(setCurrentWorkflowKey({ key: exampleInputKey, value }));
  };

  return (
    <div className="my-2 flex flex-col gap-2">
      <Editor
        value={code}
        className="border rounded outline-none"
        onValueChange={setCode}
        highlight={(code) =>
          hljs.highlight(code, {
            language: "python",
          }).value
        }
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
        }}
      />

      <div>
        <p className="font-semibold text-violet-500 text-sm">Example Input</p>
        <Editor
          value={exampleInput}
          className="border rounded outline-none"
          onValueChange={setExampleInput}
          highlight={(code) =>
            hljs.highlight(code, {
              language: "json",
            }).value
          }
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
        />
      </div>

      <CustomButton className="w-fit" onClick={testCode}>
        {isLoading ? "Loading..." : "Test Code"}
      </CustomButton>
    </div>
  );
}

export default HandleTransformer;
