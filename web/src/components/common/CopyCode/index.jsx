import { ContentCopy } from "@mui/icons-material";
import React, { useState } from "react";
import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";
import curl from "highlight.js/lib/languages/bash";
import CustomDrawer from "../CustomDrawer";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("curl", curl);

function CopyCode({ content, language, title, subtitle, help }) {
  const [isOpen, setIsOpen] = useState(true);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <CustomDrawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="p-2">
        <div>
          <h1 className="font-bold text-xl">{title}</h1>
          <p className="mt-2">{subtitle}</p>
        </div>
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
        {help && (
          <div className="mt-4 rounded border p-2 border-violet-500 bg-violet-50">
            {help}
          </div>
        )}
      </div>
    </CustomDrawer>
  );
}

export default CopyCode;
