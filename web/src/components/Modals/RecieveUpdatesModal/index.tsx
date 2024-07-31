import React, { useEffect } from "react";
import Overlay from "../../Overlay/index.tsx";
import { CloseRounded } from "@mui/icons-material";
import CustomButton from "../../common/CustomButton/index.tsx";
import posthog from "posthog-js";

const RecieveUpdatesModal = ({ isOpen, close }) => {
  const handleYes = () => {
    posthog.capture("POST_LOGIN_SUBSCRIPTION_UPDATE_INTERACTED", {
      subscription_requested: true,
    });
    close();
  };

  const handleNo = () => {
    posthog.capture("POST_LOGIN_SUBSCRIPTION_UPDATE_INTERACTED", {
      subscription_requested: false,
    });
    close();
  };

  useEffect(() => {
    if (isOpen) {
      posthog.capture("POST_LOGIN_SUBSCRIPTION_UPDATE_SHOWN");
    }
  }, [isOpen]);

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
            Would you like to receive updates about new features & releases in
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
