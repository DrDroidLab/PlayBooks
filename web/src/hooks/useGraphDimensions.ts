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
  const { steps, playbookEdges, permanentView } = useSelector(playbookSelector);
  const graphData = fetchGraphData(steps);
  const dagreData = calculateData(graphData, width, height);
  const [data, setData] = useState(dagreData);

  useEffect(() => {
    if (width && height) {
      console.log("calculating again");
      const graphData = fetchGraphData(steps);
      const dagreData = calculateData(graphData, width, height);
      setData(dagreData);
    }
  }, [width, height, steps, playbookEdges, permanentView]);

  console.log("data", data);

  return {
    graphData,
    dagreData: data,
  };
}

export default useGraphDimensions;
