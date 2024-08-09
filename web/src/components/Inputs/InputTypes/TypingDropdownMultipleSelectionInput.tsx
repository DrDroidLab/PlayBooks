import { HTMLInputTypeAttribute } from "react";
import { TypingDropdownMultipleProvider } from "../../common/TypingDropdownMultipleSelection/contexts/TypingDropdownMultipleContext";
import TypingDropdownMultipleSelection from "../../common/TypingDropdownMultipleSelection";

type TypingDropdownMultipleSelectionInputTypes = {
  label?: string;
  value: string[];
  handleChange: (val: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options?: any[];
  type?: HTMLInputTypeAttribute;
  typingContainerClassname?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

function TypingDropdownMultipleSelectionInput(
  props: TypingDropdownMultipleSelectionInputTypes,
) {
  return (
    <TypingDropdownMultipleProvider
      handleChange={props.handleChange}
      value={props.value as string[]}
      options={props.options ?? []}>
      <TypingDropdownMultipleSelection {...props} />
    </TypingDropdownMultipleProvider>
  );
}

export default TypingDropdownMultipleSelectionInput;
