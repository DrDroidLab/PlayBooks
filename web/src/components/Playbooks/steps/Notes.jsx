import MDEditor from "@uiw/react-md-editor";
import { addNotes } from "../../../store/features/playbook/playbookSlice.ts";
import rehypeSanitize from "rehype-sanitize";
import { useDispatch } from "react-redux";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import useIsExisting from "../../../hooks/useIsExisting.ts";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";

function Notes({ id }) {
  const [step] = useCurrentStep(id);
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();
  const isExisting = useIsExisting();

  return (
    <>
      <div
        style={
          isExisting
            ? step?.notes
              ? {
                  display: "flex",
                  marginTop: "5px",
                  marginBottom: "5px",
                  gap: "5px",
                }
              : {}
            : {
                display: "flex",
                marginTop: "5px",
                marginBottom: "5px",
                gap: "5px",
              }
        }>
        <div
          data-color-mode="light"
          style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {isPrefetched ? (
            step?.notes && (
              <MDEditor.Markdown
                source={step.notes}
                height={200}
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
            )
          ) : (
            <>
              <MDEditor
                value={step.notes}
                onChange={(val) => {
                  dispatch(addNotes({ notes: val, id }));
                }}
                height={200}
                style={{
                  width: "100%",
                }}
                textareaProps={{
                  placeholder: "Please enter Markdown text",
                }}
                preview="live"
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Notes;
