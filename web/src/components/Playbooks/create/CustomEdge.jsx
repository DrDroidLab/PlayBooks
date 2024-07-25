import React from "react";
import { getBezierPath, getMarkerEnd } from "reactflow";
import CustomButton from "../../common/CustomButton/index.tsx";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";
import { Tooltip } from "@mui/material";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";
import handleEdgeColor from "../../../utils/playbook/handleEdgeColor.ts";
import { Add } from "@mui/icons-material";

const foreignObjectSize = 200;

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  arrowHeadType,
  markerEndId,
  source,
}) => {
  const { rules } = useEdgeConditions(id);
  const {
    toggle,
    permanentView,
    openDrawer,
    addAdditionalData,
    additionalData,
  } = usePermanentDrawerState();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  const handleAddConditionClick = (e) => {
    e.stopPropagation();
    if (
      permanentView === PermanentDrawerTypes.CONDITION &&
      id === additionalData.id
    ) {
      toggle(PermanentDrawerTypes.CONDITION);
      return;
    }
    addAdditionalData({
      source,
      id,
    });
    openDrawer(PermanentDrawerTypes.CONDITION);
  };

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path ${
          handleEdgeColor(id) === "green" ? "animated-dotted-line" : ""
        }`}
        d={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: handleEdgeColor(id),
          strokeWidth: 2,
        }}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}>
        <div className={`flex items-center justify-center w-full h-full`}>
          {rules?.length > 0 ? (
            <CustomButton
              className={`${
                additionalData.id === id ? "shadow-md shadow-violet-500 " : ""
              } w-10 h-10 items-center !text-xl p-0 justify-center font-normal`}
              onClick={handleAddConditionClick}>
              <Tooltip title="View Condition">
                <>{`{ }`}</>
              </Tooltip>
            </CustomButton>
          ) : (
            <>
              <div className="w-full h-full rounded-full step-information" />
              <CustomButton
                className={`${
                  additionalData.id === id ? "shadow-md shadow-violet-500 " : ""
                } w-10 h-10 rounded-full items-center p-0 justify-center font-normal step-notes absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
                onClick={handleAddConditionClick}>
                <Tooltip title="Add Condition">
                  <Add fontSize="small" />
                </Tooltip>
              </CustomButton>
            </>
          )}
        </div>
      </foreignObject>
    </>
  );
};

export default CustomEdge;
