import React from "react";
import { getBezierPath, getMarkerEnd } from "reactflow";
import CustomButton from "../../common/CustomButton/index.tsx";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";
import { Tooltip } from "@mui/material";
import { PermanentDrawerTypes } from "../../../store/features/drawers/permanentDrawerTypes.ts";
import usePermanentDrawerState from "../../../hooks/usePermanentDrawerState.ts";

const foreignObjectSize = 60;

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
  target,
}) => {
  const { conditions } = useEdgeConditions(id);
  const { openDrawer, addAdditionalData } = usePermanentDrawerState();

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
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={foreignObjectSize}
        height={foreignObjectSize}
        x={labelX - foreignObjectSize / 2}
        y={labelY - foreignObjectSize / 2}>
        <body className="flex items-center justify-center w-full h-full">
          {conditions.length > 0 && (
            <CustomButton
              className="w-10 h-10 items-center !text-xl p-0 justify-center font-bold"
              onClick={handleAddConditionClick}>
              <Tooltip title="Condition">{`{ }`}</Tooltip>
            </CustomButton>
          )}
        </body>
      </foreignObject>
    </>
  );
};

export default CustomEdge;
