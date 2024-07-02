import React from "react";
import Overlay from "../../Overlay";
import { CloseRounded } from "@mui/icons-material";
import CustomButton from "../../common/CustomButton/index.tsx";

const RecieveUpdatesModal = ({ isOpen, close }) => {
  const handleYes = () => {
    close();
  };

  const handleNo = () => {
    close();
  };

  return (
    <div className="z-50">
      <Overlay close={close} visible={isOpen}>
        <div className="relative bg-white py-4 px-2 rounded max-w-full w-[300px]">
          <div
            onClick={close}
            className="absolute top-0 right-0 m-2 cursor-pointer">
            <CloseRounded />
          </div>
          <p className="font-semibold text-sm">Recieve Updates from DrDroid?</p>

          <div className="flex items-center gap-2 my-2">
            <CustomButton
              onClick={handleYes}
              className="!bg-violet-500 !text-white hover:!text-violet-500 hover:!bg-transparent">
              Yes
            </CustomButton>
            <CustomButton onClick={handleNo}>No</CustomButton>
          </div>
        </div>
      </Overlay>
    </div>
  );
};

export default RecieveUpdatesModal;
