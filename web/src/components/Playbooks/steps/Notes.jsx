import MDEditor, { EditorContext } from "@uiw/react-md-editor";
import { useContext } from "react";
import { addNotes } from "../../../store/features/playbook/playbookSlice.ts";
import rehypeSanitize from "rehype-sanitize";
import { ToggleOff, ToggleOn } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import useCurrentStep from "../../../hooks/useCurrentStep.ts";
import useIsPrefetched from "../../../hooks/useIsPrefetched.ts";
import useIsExisting from "../../../hooks/useIsExisting.ts";

const Button = () => {
  const { preview, dispatch } = useContext(EditorContext);
  const click = () => {
    dispatch({
      preview: preview === "edit" ? "preview" : "edit",
    });
  };
  if (preview === "edit") {
    return (
      <div className="flex items-center gap-2">
        <ToggleOff color="disabled" fontSize="medium" onClick={click} />
        Raw
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <ToggleOn color="primary" fontSize="medium" onClick={click} /> Preview
    </div>
  );
};

const codePreview = {
  name: "preview",
  keyCommand: "preview",
  value: "preview",
  icon: <Button />,
};

function Notes({ index }) {
  const [step] = useCurrentStep(index);
  const dispatch = useDispatch();
  const isPrefetched = useIsPrefetched();
  const isExisting = useIsExisting();

  return (
    <>
      <div
        style={
          isExisting && !step?.isCopied
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
          {isPrefetched && !step?.isCopied ? (
            step?.notes && (
              <MDEditor.Markdown
                source={step.notes}
                height={100}
                style={{
                  whiteSpace: "pre-wrap",
                  maxHeight: "200px",
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
                  dispatch(addNotes({ notes: val, index }));
                }}
                height={100}
                style={{
                  width: "100%",
                }}
                textareaProps={{
                  placeholder: "Please enter Markdown text",
                }}
                // hideToolbar={true}
                preview="edit"
                previewOptions={{
                  rehypePlugins: [[rehypeSanitize]],
                }}
                commands={[codePreview]}
                extraCommands={[]}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Notes;
