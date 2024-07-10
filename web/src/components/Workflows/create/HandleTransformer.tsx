import React from "react";
import Editor from "react-simple-code-editor";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import { useDispatch, useSelector } from "react-redux";
import {
  currentWorkflowSelector,
  setCurrentWorkflowKey,
} from "../../../store/features/workflow/workflowSlice.ts";

hljs.registerLanguage("python", python as any);
const key = "transformerCode";

function HandleTransformer() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const code = currentWorkflow[key];
  const dispatch = useDispatch();

  const setCode = (value: string) => {
    dispatch(setCurrentWorkflowKey({ key, value }));
  };

  return (
    <div className="my-2">
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
    </div>
  );
}

export default HandleTransformer;
