import useToggle from "../../../hooks/common/useToggle";
import CustomButton from "../../common/CustomButton";
import { AddRounded } from "@mui/icons-material";
import SecretCreateOverlay from "./SecretCreateOverlay";

type CreateVariableButtonProps = {
  buttonText?: string;
};

function CreateSecretButton({
  buttonText = "Secret",
}: CreateVariableButtonProps) {
  const { isOpen: isActionOpen, toggle } = useToggle();

  const handleCreateVariable = () => {
    toggle();
  };

  return (
    <div>
      <CustomButton
        className="!h-full self-stretch"
        onClick={handleCreateVariable}>
        <AddRounded fontSize="small" /> {buttonText}
      </CustomButton>

      <SecretCreateOverlay isOpen={isActionOpen} toggleOverlay={toggle} />
    </div>
  );
}

export default CreateSecretButton;
