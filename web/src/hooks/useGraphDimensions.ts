import { useEffect, useState } from "react";
import fetchGraphData from "../utils/graph/fetchGraphData.ts";
import { useSelector } from "react-redux";
import { currentPlaybookSelector } from "../store/features/playbook/playbookSlice.ts";
import { calculateData } from "../utils/calculateData.ts";
import { ReactFlowInstance } from "reactflow";
import usePermanentDrawerState from "./usePermanentDrawerState.ts";

const fitViewOptions = {
  maxZoom: 0.75,
  duration: 500,
};

type GraphDimensions = {
  graphData: any;
  dagreData: any;
};

function useGraphDimensions(
  width: number,
  height: number,
  instance: ReactFlowInstance<any, any>,
): GraphDimensions {
  const playbook = useSelector(currentPlaybookSelector);
  const { permanentView, isOpen } = usePermanentDrawerState();
  const graphData = fetchGraphData();
  const [data, setData] = useState<any>({});

  useEffect(() => {
    if (width && height) {
      const graphData = fetchGraphData();
      const dagreData = calculateData(graphData, width, height);
      setData(dagreData);
    }
    instance.fitView(fitViewOptions);
  }, [
    width,
    height,
    playbook?.steps,
    playbook?.step_relations,
    permanentView,
    instance,
    isOpen,
  ]);

  // instance.fitView(fitViewOptions);

  return {
    graphData,
    dagreData: data,
  };
}

export default useGraphDimensions;
