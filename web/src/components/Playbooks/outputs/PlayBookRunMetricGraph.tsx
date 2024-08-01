import ReactECharts from "echarts-for-react";
import styles from "./index.module.css";
import SeeMoreText from "../SeeMoreText";
import { renderTimestamp } from "../../../utils/common/dateUtils";
import useGraph from "../../../hooks/common/graph/useGraph";
import useKeyPressed from "../../../hooks/common/useKeyPressed";

interface Props {
  title: string;
  result: any;
  timestamp?: number;
  error: string;
}

const PlayBookRunMetricGraph: React.FC<Props> = ({
  title,
  result,
  timestamp,
  error,
}) => {
  const { chartOptions, showGraph, handleLegendClick, chartRef } =
    useGraph(result);
  const keyPressed = useKeyPressed();

  const onEvents = {
    legendselectchanged: handleLegendClick(keyPressed),
  };

  return (
    <div className={styles["graph-box"]}>
      <div className={styles["graph-title"]}>
        <SeeMoreText title={""} text={title} />
      </div>
      {!showGraph && (
        <div className={styles["graph-error"]}>
          {error ? (
            <SeeMoreText title={""} truncSize={150} text={error} />
          ) : (
            "No data available"
          )}
        </div>
      )}
      {showGraph && (
        <ReactECharts
          onEvents={onEvents}
          className="flex flex-1"
          option={chartOptions}
          notMerge={true}
          ref={chartRef}
        />
      )}
      {!showGraph && timestamp && (
        <p className={styles["graph-ts-error"]}>
          <i>Updated at: {renderTimestamp(timestamp)}</i>
        </p>
      )}
      {showGraph && timestamp && (
        <p className={styles["graph-ts"]}>
          <i>Updated at: {renderTimestamp(timestamp)}</i>
        </p>
      )}
    </div>
  );
};

export default PlayBookRunMetricGraph;
