import React, { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/github.css";
import { ContentCopyRounded } from "@mui/icons-material";
import unsecuredCopyToClipboard from "../../../utils/unsecuredCopy.ts";

hljs.registerLanguage("json", json);

type CodePropTypes = {
  content: string;
  language?: string;
};

const Code: React.FC<CodePropTypes> = ({ language = "json", content }) => {
  const codeRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    } else {
      unsecuredCopyToClipboard(content);
    }
  };

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightBlock(codeRef.current);
    }
  }, [content, language]);

  return (
    <div className="!bg-transparent w-full max-h-64 relative overflow-scroll rounded text-sm">
      <pre className={language === "yaml" ? "" : "flex flex-wrap"}>
        <code
          ref={codeRef}
          className={`language-${language} !bg-transparent !p-0 font-medium`}>
          {content}
        </code>
      </pre>
      <div className="absolute top-2 right-2">
        <ContentCopyRounded
          fontSize="small"
          onClick={handleCopy}
          className="hover:text-violet-500 cursor-pointer transition-all"
        />
      </div>
    </div>
  );
};

export default Code;
