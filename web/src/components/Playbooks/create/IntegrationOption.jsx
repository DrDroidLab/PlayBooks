import React from "react";
import { cardsData } from "../../../utils/cardsData";
import { useDispatch, useSelector } from "react-redux";
import {
  createStepWithSource,
  playbookSelector,
} from "../../../store/features/playbook/playbookSlice.ts";
import { CheckCircleOutline } from "@mui/icons-material";
import { SOURCES } from "../../../constants/index.ts";
import { unsupportedBuilderOptions } from "../../../utils/unsupportedBuilderOptions.ts";
import { Tooltip } from "@mui/material";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";

function IntegrationOption({ option }) {
  const { toggle } = useDrawerState(DrawerTypes.ADD_DATA);
  const dispatch = useDispatch();
  const { connectorOptionsMap } = useSelector(playbookSelector);
  const unsupported = unsupportedBuilderOptions.includes(
    `${option.source} ${option.task_type}`,
  );

  const handleImageSrc = () => {
    switch (option?.source) {
      case SOURCES.TEXT:
        if (option.task_type === SOURCES.IFRAME) {
          return cardsData.find((e) => e.enum === SOURCES.IFRAME)?.url;
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return (
          cardsData.find((e) => e.enum === option?.source?.replace("_VPC", ""))
            ?.url ??
          cardsData.find((e) => option?.model_type?.includes(e.enum))?.url
        );
    }
  };

  const handleClick = () => {
    if (unsupported) return;
    if (option.source) {
      dispatch(
        createStepWithSource({
          source: option.source,
          modelType:
            option.supported_model_types?.length > 0
              ? option.supported_model_types[0].model_type
              : option.source,
          taskType: option.task_type,
          key: option.id,
          description: option.display_name,
        }),
      );
      toggle();
    }
  };

  if (unsupported) {
    return (
      <Tooltip title="This task type is deprecated, use other Grafana Data Sources.">
        <div
          className={`flex relative items-center gap-2 p-2 bg-gray-50 rounded border-[1px] hover:bg-gray-200 cursor-pointer transition-all`}
          key={option.id}>
          {connectorOptionsMap[option.source.toLowerCase()]?.length > 0 && (
            <div className="absolute top-0 right-0 m-1 text-md">
              <CheckCircleOutline color="success" fontSize="inherit" />
            </div>
          )}
          <div
            className={`bg-white w-full h-full absolute opacity-75 top-0 left-0`}
          />
          <img className="w-10 h-10" src={handleImageSrc()} alt="logo" />
          <p className="text-sm">
            {option?.display_name ?? `${option?.source} ${option?.task_type}`}
          </p>
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      className={`flex relative items-center gap-2 p-2 bg-gray-50 rounded border-[1px] hover:bg-gray-200 cursor-pointer transition-all`}
      key={option.id}
      onClick={handleClick}>
      {connectorOptionsMap[option.source.toLowerCase()]?.length > 0 && (
        <div className="absolute top-0 right-0 m-1 text-md">
          <CheckCircleOutline color="success" fontSize="inherit" />
        </div>
      )}
      <img className="w-10 h-10" src={handleImageSrc()} alt="logo" />
      <p className="text-sm">
        {option?.display_name ?? `${option?.source} ${option?.task_type}`}
      </p>
    </div>
  );
}

export default IntegrationOption;
