import { Delete } from "@mui/icons-material";
import { deleteTask } from "../../../store/features/playbook/playbookSlice.ts";
import { useDispatch } from "react-redux";
import useCurrentTask from "../../../hooks/playbooks/task/useCurrentTask.ts";
import usePermanentDrawerState from "../../../hooks/common/usePermanentDrawerState.ts";

function DeleteTaskButton({ taskId }) {
  const [task] = useCurrentTask(taskId);
  const dispatch = useDispatch();
  const { closeDrawer } = usePermanentDrawerState();

  const handleNoAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDelete = (e) => {
    handleNoAction(e);
    dispatch(deleteTask(task?.id));
    closeDrawer();
  };

  return (
    <button
      className="w-fit cursor-pointer text-violet-500 hover:text-gray-400"
      onClick={handleDelete}>
      <Delete fontSize="medium" />
    </button>
  );
}

export default DeleteTaskButton;
