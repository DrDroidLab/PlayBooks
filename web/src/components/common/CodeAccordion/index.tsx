import React, { forwardRef, useState } from "react";
import Editor from "react-simple-code-editor";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import json from "highlight.js/lib/languages/json";
import { CodeAccordionPropTypes, LanguageTypes } from "./types/index.ts";
import isJSONString from "./utils/isJSONString.ts";
import { KeyboardArrowDown } from "@mui/icons-material";

hljs.registerLanguage("python", python as any);
hljs.registerLanguage("json", json as any);

const CodeAccordion = forwardRef<HTMLDivElement, CodeAccordionPropTypes>(
  (
    {
      code,
      language,
      label,
      onValueChange = () => {},
      disabled = false,
      className = "",
      defaultOpen = false,
      children,
      placeholder,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggle = () => setIsOpen(!isOpen);

    const value =
      language === LanguageTypes.JSON
        ? isJSONString(code)
          ? JSON.parse(JSON.stringify(code, null, 2))
          : typeof code !== "string"
          ? JSON.stringify(code, null, 2)
          : code
        : code;

    return (
      <div ref={ref}>
        <p
          onClick={toggle}
          className="font-semibold text-violet-500 text-xs transition-all cursor-pointer flex items-center">
          <KeyboardArrowDown
            className={`${isOpen ? "rotate-180" : "rotate-0"} !transition-all`}
            fontSize="small"
          />{" "}
          {label}
        </p>
        {isOpen && (
          <div className="flex flex-col gap-2 !text-xs">
            <Editor
              value={value}
              placeholder={placeholder}
              className={`${className} border rounded outline-none`}
              onValueChange={onValueChange}
              highlight={(code: string) =>
                hljs.highlight(code, {
                  language,
                }).value
              }
              disabled={disabled}
              padding={10}
            />
            {children}
          </div>
        )}
      </div>
    );
  },
);

export default CodeAccordion;
