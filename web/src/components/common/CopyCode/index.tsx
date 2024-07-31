import { ContentCopy } from "@mui/icons-material";
import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";
import json from "highlight.js/lib/languages/json";
import curl from "highlight.js/lib/languages/bash";
import unsecuredCopyToClipboard from "../../../utils/common/unsecuredCopy";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("curl", curl);
hljs.registerLanguage("json", json);

function CopyCode({ content, language }) {
  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    } else {
      unsecuredCopyToClipboard(content);
    }
  };

  return (
    <div>
      <div className="w-full flex mb-2 justify-end">
        <button
          onClick={handleCopy}
          className="border bg-white rounded p-1 text-xs font-bold flex gap-1 items-center cursor-pointer hover:border-violet-500 hover:text-violet-500 transition-all">
          <ContentCopy fontSize="small" />
          Copy Code
        </button>
      </div>
      <div className="border bg-gray-100 max-h-64 relative overflow-scroll p-2 rounded text-sm">
        <pre
          className={language === "curl" ? "flex flex-wrap" : ""}
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
