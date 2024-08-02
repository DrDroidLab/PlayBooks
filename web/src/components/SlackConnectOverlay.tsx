import Overlay from "./Overlay";
import CustomButton from "./common/CustomButton";

const SlackConnectOverlay = ({ isOpen, toggleOverlay }) => {
  const close = () => {
    toggleOverlay();
  };

  if (!isOpen) return;

  return (
    <Overlay close={close} visible={isOpen}>
      <div className="bg-white p-4 rounded max-w-xs">
        <header className="text-gray-800 text-sm">
          Join the Doctor Droid Slack Community and connect with other users.
        </header>
        <div className="flex flex-wrap gap-2 mt-4">
          <CustomButton onClick={toggleOverlay}>Cancel</CustomButton>
          <CustomButton
            onClick={() =>
              window.open(
                "https://doctor-droid-public.slack.com/",
                "_blank",
                "noopener",
              )
            }>
            Join
          </CustomButton>
        </div>
      </div>
    </Overlay>
  );
};

export default SlackConnectOverlay;
