import React, { useEffect } from "react";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import { useSelector } from "react-redux";
import { currentWorkflowSelector } from "../../../store/features/workflow/workflowSlice.ts";
import { useLazyGetSearchTriggersQuery } from "../../../store/features/triggers/api/searchTriggerApi.ts";
import CodeAccordion from "../../common/CodeAccordion/index.tsx";
import { LanguageTypes } from "../../common/CodeAccordion/types/index.ts";

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
      <CodeAccordion
        code={code}
        label="Sample slack message matching your filter"
        language={LanguageTypes.JSON}
        disabled={true}
        defaultOpen={true}
      />
    </div>
  );
}

export default AlertOutput;
