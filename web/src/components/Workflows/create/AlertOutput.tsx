import React, { useEffect } from "react";
import Editor from "react-simple-code-editor";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { useLazyGetSearchTriggersQuery } from "../../../store/features/triggers/api/searchTriggerApi.ts";

hljs.registerLanguage("json", json as any);

function AlertOutput() {
  const currentWorkflow = useSelector(currentWorkflowSelector);
  const [triggerSearch, { data }] = useLazyGetSearchTriggersQuery();

  useEffect(() => {
    triggerSearch(1, false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkflow]);

  const code = data?.alerts?.[0]?.alert_json;
  if (!code) return;

  return (
    <div className="my-2">
      <p className="font-semibold text-violet-500 text-sm">
        Last slack message
      </p>
      <Editor
        value={JSON.stringify(code, null, 2)}
        className="border rounded outline-none max-h-[150px] !overflow-y-auto"
        onValueChange={() => {}}
        highlight={(code) =>
          hljs.highlight(code, {
            language: "json",
          }).value
        }
        disabled
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
        }}
      />
    </div>
  );
}

export default AlertOutput;
