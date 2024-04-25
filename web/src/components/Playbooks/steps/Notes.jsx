import MDEditor, { EditorContext } from "@uiw/react-md-editor";
import { useContext } from "react";
import { addNotes } from "../../../store/features/playbook/playbookSlice.ts";
import rehypeSanitize from "rehype-sanitize";
import { ToggleOff, ToggleOn } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import styles from "../playbooks.module.css";

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

function Notes({ step, index }) {
  const dispatch = useDispatch();
  return (
    <>
      {step.isPrefetched && !step.isCopied && !step.isImported ? (
        step.notes && (
          <div className={styles["addConditionStyle"]}>
            <b>Notes</b>
          </div>
        )
      ) : (
        <div className={styles["addConditionStyle"]}>
          <b className="add_notes">Add note about this step</b>
        </div>
      )}
      <div
        style={
          step.isPrefetched && !step.isCopied && !step.isImported
            ? step.notes
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
          {step.isPrefetched && !step.isCopied && !step.isImported ? (
            step.notes && (
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
                  width: "50%",
                }}
              />
            )
          ) : (
            <>
              <MDEditor
                value={step.notes}
                onChange={(val) => {
                  dispatch(addNotes({ index, notes: val }));
                }}
                height={100}
                style={{
                  width: "50%",
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
