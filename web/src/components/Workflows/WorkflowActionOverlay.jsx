/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import Overlay from "../Overlay/index.jsx";
import { CircularProgress } from "@mui/material";
import { useDeleteWorkflowMutation } from "../../store/features/workflow/api/deleteWorkflowApi.ts";

const WorkflowActionOverlay = ({
  workflow,
  isOpen,
  toggleOverlay,
  refreshTable,
}) => {
  const [deleteWorkflow, { isLoading, isSuccess, status }] =
    useDeleteWorkflowMutation();
  const handleSuccess = () => {
    deleteWorkflow(workflow.id);
  };

  useEffect(() => {
    if (isSuccess) {
      toggleOverlay();
      refreshTable();
    }
  }, [status]);

  return (
    <>
      {isOpen && (
        <Overlay close={toggleOverlay} visible={isOpen}>
          <div className="bg-white p-5 rounded w-[400px] min-h-[100px] max-h-[500px] overflow-scroll">
            <header className="text-gray-500">Delete {workflow.name}?</header>
            <div className="flex gap-2 mt-4 mb-2">
              <button
                className="rounded border border-violet-500 text-violet-500 hover:text-white hover:bg-violet-500 transition-all p-1"
                onClick={toggleOverlay}>
                Cancel
              </button>
              <button
                className="rounded border border-violet-500 text-violet-500 hover:text-white hover:bg-violet-500 transition-all p-1"
                sx={{ marginLeft: "5px" }}
                onClick={handleSuccess}>
                Yes
              </button>
              {isLoading && (
                <CircularProgress
                  style={{
                    marginLeft: "12px",
                  }}
                  size={20}
                />
              )}
            </div>
          </div>
        </Overlay>
      )}
    </>
  );
};

export default WorkflowActionOverlay;
