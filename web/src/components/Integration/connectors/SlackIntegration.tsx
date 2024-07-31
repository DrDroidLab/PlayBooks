import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { CircularProgress, Switch } from "@mui/material";
import Heading from "../../Heading.tsx";
import styles from "../../../css/createMonitor.module.css";
import {
  updateSlackRca,
  useGetSlackAssetsQuery,
} from "../../../store/features/integrations/api/index.ts";

const SlackIntegration = () => {
  const dispatch = useDispatch();
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const { data, isFetching, error } = useGetSlackAssetsQuery();

  useEffect(() => {
    // Assuming `data` structure doesn't change. Otherwise, safely check each level.
    const newSelected =
      data?.assets?.[0]?.slack?.assets?.reduce(
        (acc, asset) => ({
          ...acc,
          [asset.id]: asset.slack_channel.metadata.is_auto_rca_enabled,
        }),
        {},
      ) || {};
    setSelected(newSelected);
  }, [data]);

  const handleToggle = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const promises = Object.entries(selected).map(([key, value]) =>
        dispatch(
          updateSlackRca.initiate({
            channelId: key,
            val: value as boolean,
          }) as any,
        ).unwrap(),
      );

      await Promise.all(promises);
      // Consider adding some feedback to the user upon successful save.
    } catch (error) {
      console.error("Error saving settings:", error);
      // Consider handling error state visually for the user here.
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) return <CircularProgress />;
  if (error) return <>There was an error</>;

  return (
    <>
      <Heading heading="Slack Integration Setup" />
      <div className={styles.container}>
        <div className={styles.heading}>
          Enable Auto-RCA recommendation for your channels
        </div>
        {data?.assets?.[0]?.slack?.assets?.map((asset) => (
          <div
            className={styles.eventTypeSelectionSection}
            style={{ justifyContent: "start", alignItems: "center" }}
            key={asset.id}>
            <div style={{ fontSize: "13px", width: "150px" }}>
              #{asset.slack_channel.channel_name}
            </div>
            <Switch
              onChange={() => handleToggle(asset.id)}
              checked={!!selected[asset.id]}
            />
          </div>
        ))}
        {loading && <CircularProgress />}
      </div>
      <button
        className="text-xs bg-white hover:bg-violet-500 hover:color-white-500 py-1 px-1 border border-gray-400 rounded shadow"
        onClick={handleSave}
        style={{
          marginLeft: "12px",
          marginBottom: "12px",
        }}
        disabled={isFetching}>
        {loading ? "Saving..." : "Save"}
      </button>
    </>
  );
};

export default SlackIntegration;
