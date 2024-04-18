/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import styles from './styles.module.css';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  timeRangeSelector,
  updateProperty,
  updateTimeRange
} from '../../../store/features/timeRange/timeRangeSlice.ts';
import useToggle from '../../../hooks/useToggle.js';
import Toast from '../../Toast.js';
import { playbooksTimeRangeOptions } from '../../../utils/timeRangeOptions.ts';

const renderTimeRangeMenuItems = timeRangeOptions => {
  if (timeRangeOptions === undefined) {
    return;
  }

  return Object.keys(timeRangeOptions).map(key => (
    <MenuItem key={key} value={key}>
      {timeRangeOptions[key]?.displayLabel}
    </MenuItem>
  ));
};

const convertDateTimeToEpoch = dateTime => {
  return Math.floor(Date.parse(dateTime) / 1000);
};

function formatDate(inputDate) {
  if (!inputDate) return '';
  const date = new Date(inputDate * 1000);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
const CustomTimeRangePicker = ({ onTimeRangeChangeCb, defaultTimeRange, isPlayground }) => {
  const { timeRange: currentSelected, startTime, endTime } = useSelector(timeRangeSelector);
  const dispatch = useDispatch();

  const isCustom = currentSelected === 'Custom';
  const isTillNow = currentSelected === 'CustomTillNow';

  const { isOpen: IsError, toggle: toggleError } = useToggle();
  const [submitError, setSubmitError] = useState();

  useEffect(() => {
    if (defaultTimeRange) {
      updateTimeRange(defaultTimeRange);
      dispatch(updateTimeRange(defaultTimeRange));
    }
  }, [defaultTimeRange]);

  const validate = () => {
    if (startTime > endTime) {
      toggleError();
      setSubmitError('Choose end time later than the start time');
      return false;
    }

    return true;
  };

  const onTimeRangeChange = event => {
    if (!(event.target.value === 'Custom' || event.target.value === 'CustomTillNow')) {
      onTimeRangeChangeCb();
    }
    dispatch(updateTimeRange(event.target.value));
  };

  const handleTimeSelectorChange = e => {
    if (!validate()) return;

    dispatch(
      updateProperty({
        key: e.target.name,
        value: convertDateTimeToEpoch(e.target.value)
      })
    );
  };

  return (
    <>
      <div className={styles['timeRangePicker']}>
        {(isCustom || isTillNow) && (
          <div className={styles['timeSelectorGroup']}>
            <input
              type="datetime-local"
              className={styles.timeSelector}
              name="startTime"
              defaultValue={formatDate(startTime) ?? ''}
              onChange={handleTimeSelectorChange}
              disabled={isPlayground}
            />
            <ArrowRightAltIcon />
            {isTillNow ? (
              <span>Now</span>
            ) : (
              <input
                type="datetime-local"
                className={styles.timeSelector}
                name="endTime"
                defaultValue={formatDate(endTime) ?? ''}
                onChange={handleTimeSelectorChange}
                disabled={isPlayground}
              />
            )}
          </div>
        )}
        <div className={styles['timeRangeSelector']}>
          <FormControl>
            <InputLabel id="time-range-select-label">Time Range</InputLabel>
            <Select
              value={currentSelected}
              label="TimeRange"
              id="time-range-select"
              onChange={onTimeRangeChange}
              labelId="time-range-select-label"
              size="small"
              disabled={isPlayground}
            >
              {renderTimeRangeMenuItems(playbooksTimeRangeOptions)}
            </Select>
          </FormControl>
        </div>
      </div>

      <Toast
        open={!!IsError}
        severity="error"
        message={submitError}
        handleClose={() => toggleError()}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={60000}
      />
    </>
  );
};

export default CustomTimeRangePicker;
