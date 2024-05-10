import React from "react";
import { cardsData } from "../../../utils/cardsData";
import { useDispatch } from "react-redux";
import { createStepWithSource } from "../../../store/features/playbook/playbookSlice.ts";

function IntegrationOption({ option, setIsOpen }) {
  const dispatch = useDispatch();

  const handleClick = (item) => {
    if (item.connector_type) {
      dispatch(
        createStepWithSource({
          source: item.connector_type,
          modelType: item.model_type,
          key: item.id,
        }),
      );
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`flex relative items-center gap-2 p-2 bg-gray-50 rounded border-[1px]  hover:bg-gray-200 cursor-pointer transition-all`}
      key={option.id}
      onClick={() => handleClick(option)}>
      <div
        className={`${
          option?.connector_type ? "hidden" : "block"
        } bg-white w-full h-full absolute opacity-75 top-0 left-0`}
      />
      <img
        className="w-10 h-10"
        src={
          cardsData.find(
            (e) =>
              e.enum === option?.connector_type?.replace("_VPC", "")
          )?.url ?? cardsData.find(
            (e) =>
              option?.model_type?.includes(e.enum)
          )?.url
        }
        alt="logo"
      />
      {/* <div>
                    <p className="text-xs font-bold text-gray-500">{data.connector_type}</p>
                    <p className="font-semibold">{data.display_name}</p>
                  </div> */}
      <p className="text-sm">{option.label}</p>
    </div>
  );
}

export default IntegrationOption;
