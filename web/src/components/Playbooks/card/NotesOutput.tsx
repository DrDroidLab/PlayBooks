import React, { useRef, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

type NotesOutputPropTypes = {
  stepId: string | undefined;
};

function NotesOutput({ stepId }: NotesOutputPropTypes) {
  const [step] = useCurrentStep(stepId);
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

  if (!step?.notes) return null;

  return (
    <div
      data-color-mode="light"
      ref={notesRef}
      className="max-h-[400px] max-w-md">
      <MDEditor.Markdown
        source={step.notes}
        className="border-2 rounded p-3 w-full max-h-[400px] overflow-y-auto"
      />
    </div>
  );
}

export default NotesOutput;
