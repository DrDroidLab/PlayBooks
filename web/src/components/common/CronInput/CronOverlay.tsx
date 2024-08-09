import { CloseRounded } from "@mui/icons-material";
import Overlay from "../../Overlay";
import "react-js-cron/dist/styles.css";
import { Cron } from "react-js-cron";
import { useState } from "react";
import CustomInput from "../../Inputs/CustomInput";
import { InputTypes } from "../../../types";
import CustomButton from "../CustomButton";

type CronOverlayProps = {
  isOpen: boolean;
  close: () => void;
  value: string;
  setValue: (val: string) => void;
};

const CronOverlay = ({ isOpen, close, value, setValue }: CronOverlayProps) => {
  return (
    <div style={{ zIndex: "200" }}>
      <Overlay close={() => {}} visible={isOpen}>
        <div className="relative bg-white p-4 rounded-lg w-[384px] flex flex-col overflow-hidden">
          <div className="flex flex-wrap">
            <div className="flex flex-col gap-4">
              <CustomInput
                value={value}
                handleChange={(val: string) => setValue(val)}
                label="Cron"
                inputType={InputTypes.TEXT}
                className="w-full"
                containerClassName="w-full"
              />
              <p className="text-xs flex items-center gap-2 text-violet-500">
                <hr className="w-full" />
                OR
                <hr className="w-full" />
              </p>
              <Cron
                value={value}
                setValue={setValue}
                allowClear={true}
                allowEmpty={"always"}
                allowedDropdowns={[
                  "hours",
                  "minutes",
                  "month-days",
                  "week-days",
                  "months",
                  "period",
                ]}
                clearButtonAction="fill-with-every"
                clockFormat="12-hour-clock"
                defaultPeriod="hour"
                clearButton={true}
                allowedPeriods={["day", "hour", "month", "week"]}
                periodicityOnDoubleClick={true}
                className="text-xs"
                clearButtonProps={{
                  className:
                    "!bg-violet-500 hover:!text-violet-500 hover:!bg-white border border-violet-500 !text-xs !p-1",
                }}
              />
            </div>
            <div
              className="absolute top-0 right-0 m-2 cursor-pointer text-gray-500 hover:text-black"
              onClick={close}>
              <CloseRounded />
            </div>
          </div>
          <CustomButton className="!text-sm !w-fit" onClick={close}>
            Save
          </CustomButton>
        </div>
      </Overlay>
    </div>
  );
};

export default CronOverlay;
