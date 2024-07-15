import React, { useRef, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import useCurrentTask from "../../../hooks/useCurrentTask.ts";

type NotesOutputPropTypes = {
  taskId: string | undefined;
};

function NotesOutput({ taskId }: NotesOutputPropTypes) {
  const [task] = useCurrentTask(taskId);
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

  if (!task?.notes) return null;

  return (
    <div
      data-color-mode="light"
      ref={notesRef}
      className="max-h-[400px] max-w-md">
      <MDEditor.Markdown
        source={task.notes}
        className="border-2 rounded p-1 w-full max-h-[400px] overflow-y-auto"
      />
    </div>
  );
}

export default NotesOutput;
