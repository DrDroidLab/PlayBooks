import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

type DropdownContextType = {
  isOpen: boolean;
  toggle: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  registerRef: (ref: React.RefObject<HTMLElement>) => void;
};

const DropdownContext = createContext<DropdownContextType | undefined>(
  undefined,
);

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const additionalRefs = useRef<React.RefObject<HTMLElement>[]>([]);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  const registerRef = (ref: React.RefObject<HTMLElement>) => {
    additionalRefs.current.push(ref);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const refsToCheck = [dropdownRef, ...additionalRefs.current];
      const isClickOutside = refsToCheck
        .filter((e) => e?.current)
        .every(
          (ref) => ref.current && !ref.current.contains(event.target as Node),
        );

      if (isClickOutside) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider
      value={{ isOpen, toggle, dropdownRef, registerRef }}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error(
      "useDropdownContext must be used within a DropdownProvider",
    );
  }
  return context;
};
