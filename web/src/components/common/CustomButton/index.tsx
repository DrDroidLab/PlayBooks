import React from "react";

type CustomButtonTypes = {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

function CustomButton({ children, onClick }: CustomButtonTypes) {
  return (
    <button
      onClick={onClick}
      className="flex gap-1 items-center text-sm bg-white hover:bg-violet-500 text-violet-500 hover:text-white rounded p-1 border border-violet-500 shrink-0 transition-all">
      {children}
    </button>
  );
}

export default CustomButton;
