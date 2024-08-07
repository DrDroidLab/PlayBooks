import { useDeleteWorkflowMutation } from "../../../store/features/workflow/api";
import Overlay from "../../Overlay";
import CustomButton from "../../common/CustomButton";

function ActionOverlay({ isOpen, toggleOverlay, item }) {
  const [deleteDynamicAlert] = useDeleteWorkflowMutation();

  const handleSuccess = async () => {
    const response = await deleteDynamicAlert(item.id).unwrap();
    if (response.success) {
      toggleOverlay();
      window.location.reload();
    }
  };

  if (!isOpen) return;

  return (
    <Overlay close={toggleOverlay} visible={isOpen}>
      <div className="bg-white rounded-md p-4 w-[384px]">
        <header className="text-gray-500">Delete alert "{item.name}"?</header>
        <div className="flex items-center gap-2 mt-4">
          <CustomButton onClick={toggleOverlay}>Cancel</CustomButton>
          <CustomButton onClick={handleSuccess}>Yes</CustomButton>
        </div>
      </div>
    </Overlay>
  );
}

export default ActionOverlay;
