import React, { useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/default.css"; // You can choose a different theme if you prefer

hljs.registerLanguage("json", json);

type CodePropTypes = {
  content: string;
  language?: string;
};

const Code: React.FC<CodePropTypes> = ({ language = "json", content }) => {
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightBlock(codeRef.current);
    }
  }, [content, language]);

  return (
    <div className="border bg-white max-h-64 relative overflow-scroll rounded text-sm">
      <pre className={language === "yaml" ? "" : "flex flex-wrap"}>
        <code ref={codeRef} className={`language-${language}`}>
          {content}
        </code>
      </pre>
    </div>
  );
};

export default Code;
