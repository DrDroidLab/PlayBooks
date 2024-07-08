import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import useTimeRange from "../hooks/useTimeRange";

import Toast from "../components/Toast";
import useToggle from "../hooks/useToggle";

import styles from "./timepicker.module.css";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  updateCustomTillNowTimeRange as updateCustomTillNowTimeRangeSlice,
  updateCustomTimeRange as updateCustomTimeRangeSlice,
  updateTimeRange as updateTimeRangeSlice,
} from "../store/features/timeRange/timeRangeSlice.ts";

const renderTimeRangeMenuItems = (timeRangeOptions) => {
  if (timeRangeOptions === undefined) {
    return;
  }

  return Object.keys(timeRangeOptions).map((key) => (
    <MenuItem key={key} value={key}>
      {timeRangeOptions[key].displayLabel}
    </MenuItem>
  ));
};

const convertEpochToDateTime = (epochTime) => {
  let date = new Date(epochTime * 1000);

  let year = date.getFullYear();
  let month = ("0" + (date.getMonth() + 1)).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);
  let hours = ("0" + date.getHours()).slice(-2);
  let minutes = ("0" + date.getMinutes()).slice(-2);

  let formattedDateTime =
    year + "-" + month + "-" + day + "T" + hours + ":" + minutes;
  return formattedDateTime;
};

const convertDateTimeToEpoch = (dateTime) => {
  return Date.parse(dateTime) / 1000;
};

const TimeRangePicker = () => {
  const {
    timeRange,
    updateTimeRange,
    updateCustomTimeRange,
    updateCustomTillNowTimeRange,
    getTimeRangeOptions,
    getTimeRange,
  } = useTimeRange();
  const dispatch = useDispatch();

  const previousTimeRange = getTimeRange();
  const [timeRangeChanged, setTimeRangeChanged] = useState();
  const [isCustomTimeRangeSelected, setIsCustomTimeRangeSelected] = useState(
    timeRange === "Custom",
  );
  const [
    isCustomTillNowTimeRangeSelected,
    setIsCustomTillNowTimeRangeSelected,
  ] = useState(timeRange === "CustomTillNow");
  const [startTime, setStartTime] = useState(
    convertEpochToDateTime(previousTimeRange.time_geq),
  );
  const [endTime, setEndTime] = useState(
    convertEpochToDateTime(previousTimeRange.time_lt),
  );
  const { isOpen: IsError, toggle: toggleError } = useToggle();
  const [submitError, setSubmitError] = useState();

  if (timeRangeChanged) {
    setTimeRangeChanged(false);
  }

  const onTimeRangeChange = (event) => {
    if (event.target.value === "Custom") {
      const previousTimeRange = getTimeRange();
      let startTimeValue = convertEpochToDateTime(previousTimeRange.time_geq);
      let endTimeValue = convertEpochToDateTime(previousTimeRange.time_lt);
      setStartTime(startTimeValue);
      setEndTime(endTimeValue);
      setIsCustomTillNowTimeRangeSelected(false);
      setIsCustomTimeRangeSelected(true);
      updateCustomTimeRange(
        previousTimeRange.time_geq,
        previousTimeRange.time_lt,
      );
      dispatch(
        updateCustomTimeRangeSlice({
          startTime: previousTimeRange.time_geq,
          endTime: previousTimeRange.time_lt,
        }),
      );
    } else if (event.target.value === "CustomTillNow") {
      const previousTimeRange = getTimeRange();
      let startTimeValue = convertEpochToDateTime(previousTimeRange.time_geq);
      setStartTime(startTimeValue);
      setIsCustomTimeRangeSelected(false);
      setIsCustomTillNowTimeRangeSelected(true);
      updateCustomTillNowTimeRange(previousTimeRange.time_geq);
      dispatch(updateCustomTillNowTimeRangeSlice(previousTimeRange.time_geq));
      setStartTime(startTimeValue);
    } else {
      setIsCustomTillNowTimeRangeSelected(false);
      setIsCustomTimeRangeSelected(false);
      updateTimeRange(event.target.value);
      dispatch(updateTimeRangeSlice(event.target.value));
      setTimeRangeChanged(true);
    }
  };

  const handleTimeSelectorChange = () => {
    if (isCustomTimeRangeSelected) {
      let startTimeValue = convertDateTimeToEpoch(
        document.getElementById("startTimeSelector").value,
      );
      let endTimeValue = convertDateTimeToEpoch(
        document.getElementById("endTimeSelector").value,
      );

      if (!startTimeValue || !endTimeValue) {
        toggleError();
        setSubmitError("Please select start and end time");
        return;
      }

      if (startTimeValue > endTimeValue) {
        toggleError();
        setSubmitError("Choose end time later than the start time");
        return;
      }

      updateCustomTimeRange(startTimeValue, endTimeValue);
      dispatch(
        updateCustomTillNowTimeRangeSlice({
          startTime: startTimeValue,
          endTime: endTimeValue,
        }),
      );
    }
  };

  const handleCustomTillNowChange = (e) => {
    const startTimeValue = convertDateTimeToEpoch(e?.target?.value);
    setStartTime(e?.target?.value);
    const currentTimeStamp = Math.floor(Date.now() / 1000);
    if (!startTimeValue) {
      toggleError();
      setSubmitError("Please select start time");
      return;
    }
    if (startTimeValue > currentTimeStamp) {
      toggleError();
      setSubmitError("Choose end time later than the start time");
      return;
    }
    updateCustomTillNowTimeRange(startTimeValue);
    dispatch(updateCustomTillNowTimeRangeSlice(startTimeValue));
  };
  return (
    <>
      <div className={styles["timeRangePicker"]}>
        {isCustomTimeRangeSelected && !isCustomTillNowTimeRangeSelected && (
          <div className={styles["timeSelectorGroup"]}>
            <input
              type="datetime-local"
              className={styles["timeSelector"]}
              id="startTimeSelector"
              defaultValue={startTime}
              onChange={(e) => handleTimeSelectorChange()}
            />
            <ArrowRightAltIcon />
            <input
              type="datetime-local"
              className={styles["timeSelector"]}
              id="endTimeSelector"
              defaultValue={endTime}
              onChange={(e) => handleTimeSelectorChange()}
            />
          </div>
        )}
        {isCustomTillNowTimeRangeSelected && !isCustomTimeRangeSelected && (
          <div className={styles["timeSelectorGroup"]}>
            <input
              type="datetime-local"
              className={styles["timeSelector"]}
              id="startTimeSelector"
              value={startTime}
              onChange={handleCustomTillNowChange}
            />
            <span>
              <ArrowRightAltIcon />
            </span>

            <span>Now</span>
          </div>
        )}
        <div className={styles["timeRangeSelector"]}>
          <FormControl>
            <InputLabel id="time-range-select-label">Time Range</InputLabel>
            <Select
              value={timeRange}
              label="TimeRange"
              id="time-range-select"
              onChange={onTimeRangeChange}
              labelId="time-range-select-label"
              size="small">
              {renderTimeRangeMenuItems(getTimeRangeOptions())}
            </Select>
          </FormControl>
        </div>
      </div>

      <Toast
        open={!!IsError}
        severity="error"
        message={submitError}
        handleClose={() => toggleError()}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={60000}
      />
    </>
  );
};

export default TimeRangePicker;
