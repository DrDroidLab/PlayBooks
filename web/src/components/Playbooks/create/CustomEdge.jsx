import React from "react";
import { getBezierPath, getMarkerEnd } from "reactflow";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Close } from "@mui/icons-material";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import useEdgeConditions from "../../../hooks/useEdgeConditions.ts";

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
  const { conditions } = useEdgeConditions(source, target);
  const { openDrawer, addAdditionalData } = useDrawerState(
    DrawerTypes.CONDITION,
  );
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
      target,
    });
    openDrawer();
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
              className="w-10 h-10 items-center rotate-45 p-0 justify-center font-bold"
              onClick={handleAddConditionClick}>
              <Close fontWeight="inherit" />
            </CustomButton>
          )}
        </body>
      </foreignObject>
    </>
  );
};

export default CustomEdge;
