import { ContentCopy } from "@mui/icons-material";
import React from "react";
import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";
import curl from "highlight.js/lib/languages/bash";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("curl", curl);

function CopyCode({ content, language }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="my-2 lg:max-w-xl">
      <div className="w-full flex justify-end">
        <button
          onClick={handleCopy}
          className="border my-2 bg-white rounded p-1 text-xs font-bold flex gap-1 items-center cursor-pointer hover:border-violet-500 hover:text-violet-500 transition-all">
          <ContentCopy fontSize="small" />
          Copy Code
        </button>
      </div>
      <div className="border bg-gray-100 h-64 relative overflow-scroll p-2">
        <pre
          dangerouslySetInnerHTML={{
            __html: hljs.highlight(content, {
              language,
            }).value,
          }}
        />
      </div>
    </div>
  );
}

export default CopyCode;
