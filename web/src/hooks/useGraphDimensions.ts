import { useEffect, useState } from "react";
import fetchGraphData from "../utils/graph/fetchGraphData.ts";
import { useSelector } from "react-redux";
import { playbookSelector } from "../store/features/playbook/playbookSlice.ts";
import { calculateData } from "../utils/calculateData.ts";

type GraphDimensions = {
  graphData: any;
  dagreData: any;
};

function useGraphDimensions(width: number, height: number): GraphDimensions {
  const { steps, playbookEdges } = useSelector(playbookSelector);
  const graphData = fetchGraphData(steps);
  const dagreData = calculateData(graphData, width, height);
  const [data, setData] = useState(dagreData);

  useEffect(() => {
    if (width && height) {
      const graphData = fetchGraphData(steps);
      const dagreData = calculateData(graphData, width, height);
      setData(dagreData);
    }
  }, [width, height, steps, steps.length, playbookEdges]);

  return {
    graphData,
    dagreData: data,
  };
}

export default useGraphDimensions;
