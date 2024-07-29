import { useEffect, useRef, useState } from "react";

type UseDropdownReturnTypes = {
  isOpen: boolean;
  handleSelect: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    option: any,
  ) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  toggle: () => void;
  setIsOpen: Function;
};

function useDropdown(
  handleChange: (id: string) => void,
): UseDropdownReturnTypes {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    option: any,
  ) => {
    e.preventDefault();
    handleChange(option.id);
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropdownRef?.current &&
        !dropdownRef?.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return {
    isOpen,
    handleSelect,
    dropdownRef,
    toggle,
    setIsOpen,
  };
}

export default useDropdown;
