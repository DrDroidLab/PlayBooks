import React from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "reactflow";
// import CustomButton from "../../common/CustomButton/index.tsx";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="nodrag nopan">
          {/* <CustomButton onClick={handleClick}>Add Condition</CustomButton> */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
