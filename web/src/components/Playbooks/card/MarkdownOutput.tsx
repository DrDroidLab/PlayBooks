import React, { useRef, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";

type MarkdownOutputPropTypes = {
  content: string | undefined;
  className?: string;
};

function MarkdownOutput({ content, className }: MarkdownOutputPropTypes) {
  const notesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (e) => {
      if (notesRef.current && notesRef.current.contains(e.target)) {
        e.stopPropagation();
      }
    };

    const currentRef = notesRef.current;
    if (currentRef) {
      currentRef.addEventListener("wheel", handleScroll, { passive: false });
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("wheel", handleScroll);
      }
    };
  }, []);

  if (!content) return null;

  return (
    <div data-color-mode="light" ref={notesRef}>
      <MDEditor.Markdown
        source={content}
        className={`${className} p-3 w-full max-h-[400px] overflow-y-auto`}
      />
    </div>
  );
}

export default MarkdownOutput;
