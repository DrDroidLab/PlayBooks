import { useEffect, useRef, useState } from "react";

type UseDropdownReturnType = {
  isOpen: boolean;
  toggle: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  datetimePickerRef: React.RefObject<HTMLDivElement>;
};

function useDropdown(): UseDropdownReturnType {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const datetimePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        datetimePickerRef.current &&
        !datetimePickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, datetimePickerRef]);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    toggle,
    dropdownRef,
    datetimePickerRef,
  };
}

export default useDropdown;
