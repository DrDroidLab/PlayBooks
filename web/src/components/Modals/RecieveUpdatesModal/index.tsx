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
        <div className="relative bg-white py-6 px-4 rounded max-w-full w-[300px]">
          <div
            onClick={close}
            className="absolute top-0 right-0 m-2 cursor-pointer">
            <CloseRounded />
          </div>
          <p className="font-semibold text-sm">
            Would you like to receive updates about new features & releases at
            Playbooks?
          </p>

          <div className="flex items-center gap-2 mt-4">
            <CustomButton
              onClick={handleYes}
              className="!bg-violet-500 !text-white hover:!text-violet-500 hover:!bg-transparent">
              Yes Please!
            </CustomButton>
            <CustomButton onClick={handleNo}>No thanks</CustomButton>
          </div>
        </div>
      </Overlay>
    </div>
  );
};

export default RecieveUpdatesModal;
