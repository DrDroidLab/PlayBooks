import MDEditor from "@uiw/react-md-editor";
import React from "react";
import rehypeSanitize from "rehype-sanitize";

type WsyisygInputTypes = {
  value: string;
  handleChange: any;
  label?: string;
  error?: string;
  disabled?: boolean;
};

function Wysiwyg({ value, handleChange, disabled, error }: WsyisygInputTypes) {
  return (
    <div data-color-mode="light">
      {disabled ? (
        <>
          <MDEditor.Markdown
            source={value}
            style={{
              whiteSpace: "pre-wrap",
              maxHeight: "400px",
              overflow: "scroll",
              border: "1px solid black",
              borderRadius: "5px",
              padding: "1rem",
              width: "100%",
            }}
          />
        </>
      ) : (
        <MDEditor
          value={value}
          onChange={handleChange}
          height={200}
          textareaProps={{
            placeholder: "Please enter Markdown text",
          }}
          className={`${error ? "border-red-500" : ""} w-full`}
          preview="live"
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
        />
      )}
    </div>
  );
}

export default Wysiwyg;
