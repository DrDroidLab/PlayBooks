import { CloseRounded } from "@mui/icons-material";
import Overlay from "../../Overlay";
import CreateSecretForm from "./CreateSecretForm";

type SecretCreateOverlayProps = {
  isOpen: boolean;
  toggleOverlay: () => void;
  id?: string;
};

const SecretCreateOverlay = ({
  isOpen,
  toggleOverlay,
  id,
}: SecretCreateOverlayProps) => {
  return (
    <>
      {isOpen && (
        <Overlay visible={isOpen}>
          <div className="relative bg-white dark:bg-gray-900 rounded-lg px-4 py-4 w-screen md:max-w-sm max-w-xs w-96 m-auto mx-2">
            <div className="absolute m-2 top-0 right-0 cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 hover:dark:text-gray-200 transition-all">
              <CloseRounded onClick={toggleOverlay} />
            </div>
            <CreateSecretForm toggleOverlay={toggleOverlay} id={id} />
          </div>
        </Overlay>
      )}
    </>
  );
};

export default SecretCreateOverlay;
