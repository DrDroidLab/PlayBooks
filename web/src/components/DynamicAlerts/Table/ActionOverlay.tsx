import Overlay from "../../Overlay";
import CustomButton from "../../common/CustomButton";

function ActionOverlay({ isOpen, toggleOverlay }) {
  const handleSuccess = () => {};

  if (!isOpen) return;

  return (
    <Overlay close={toggleOverlay} visible={isOpen}>
      <div>
        <header className="text-gray-500">Delete?</header>
        <div>
          <CustomButton onClick={toggleOverlay}>Cancel</CustomButton>
          <CustomButton onClick={handleSuccess}>Yes</CustomButton>
        </div>
      </div>
    </Overlay>
  );
}

export default ActionOverlay;
