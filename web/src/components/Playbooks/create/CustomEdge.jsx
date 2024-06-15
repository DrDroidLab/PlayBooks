import React from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "reactflow";
import CustomButton from "../../common/CustomButton/index.tsx";
import usePlaybookKey from "../../../hooks/usePlaybookKey.ts";

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
}) => {
  const [playbookEdges] = usePlaybookKey("playbookEdges");
  const [parentIndex, childIndex] = extractNumbers(id);
  const edge = playbookEdges.find(
    (edge) =>
      edge.source === `node-${parentIndex}` &&
      edge.target === `node-${childIndex}`,
  );

  console.log("edge", edge);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleAddConditionClick = () => {};

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
          <CustomButton onClick={handleAddConditionClick}>
            Add Condition
          </CustomButton>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
