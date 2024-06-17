import React from "react";
import { getBezierPath, getMarkerEnd } from "reactflow";
import CustomButton from "../../common/CustomButton/index.tsx";
import { Close } from "@mui/icons-material";
import useDrawerState from "../../../hooks/useDrawerState.ts";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";

const foreignObjectSize = 60;

function extractNumbers(input) {
  // Use regular expression to match numbers in the string
  const numbers = input.match(/\d+/g);

  // Convert the matched strings to integers
  const result = numbers ? numbers.map(Number) : [];

  return result;
}

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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const { openDrawer, addAdditionalData } = useDrawerState(
    DrawerTypes.CONDITION,
  );
  const markerEnd = getMarkerEnd(arrowHeadType, markerEndId);

  const handleAddConditionClick = (e) => {
    e.stopPropagation();
    const [sourceId] = extractNumbers(source);
    addAdditionalData({ source: sourceId });
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
          <CustomButton
            className="w-10 h-10 items-center rotate-45 p-0 justify-center font-bold"
            onClick={handleAddConditionClick}>
            <Close fontWeight="inherit" />
          </CustomButton>
        </body>
      </foreignObject>
    </>
  );
};

export default CustomEdge;
