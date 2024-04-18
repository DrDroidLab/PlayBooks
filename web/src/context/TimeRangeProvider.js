import { createContext, useCallback, useState } from 'react';

const getCurrentTimeStamp = () => {
  return Math.floor(Date.now() / 1000);
};

const defaultTimeRangeOptions = {
  '2weeks': {
    displayLabel: '2 weeks',
    getTimeRange: () => {
      let currentTimestamp = getCurrentTimeStamp();
      return { time_geq: currentTimestamp - 1209600, time_lt: currentTimestamp };
    }
  },
  '1month': {
    displayLabel: '1 month',
    getTimeRange: () => {
      let currentTimestamp = getCurrentTimeStamp();
      return { time_geq: currentTimestamp - 2419200, time_lt: currentTimestamp };
    }
  },
  '3months': {
    displayLabel: '3 months',
    getTimeRange: () => {
      let currentTimestamp = getCurrentTimeStamp();
      return { time_geq: currentTimestamp - 7257600, time_lt: currentTimestamp };
    }
  },
  '6months': {
    displayLabel: '6 months',
    getTimeRange: () => {
      let currentTimestamp = getCurrentTimeStamp();
      return { time_geq: currentTimestamp - 14515200, time_lt: currentTimestamp };
    }
  },
  '12months': {
    displayLabel: '12 months',
    getTimeRange: () => {
      let currentTimestamp = getCurrentTimeStamp();
      return { time_geq: currentTimestamp - 29030400, time_lt: currentTimestamp };
    }
  },
  Custom: {
    displayLabel: 'Custom'
  },
  CustomTillNow: {
    displayLabel: 'Custom till now'
  }
};

const TimeRangeContext = createContext({});

export const TimeRangeProvider = ({ children }) => {
  const [timeRange, setTimeRange] = useState('2weeks');

  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();

  const updateTimeRange = value => {
    setTimeRange(value);
  };

  const updateCustomTimeRange = (start, end) => {
    setStartTime(start);
    setEndTime(end);
    setTimeRange('Custom');
  };

  const updateCustomTillNowTimeRange = start => {
    setStartTime(start);
    setTimeRange('CustomTillNow');
  };
  const getTimeRange = useCallback(() => {
    if (timeRange === 'Custom') {
      return { time_geq: startTime, time_lt: endTime };
    } else if (timeRange === 'CustomTillNow') {
      return { time_geq: startTime, time_lt: getCurrentTimeStamp() };
    } else {
      return defaultTimeRangeOptions[timeRange].getTimeRange();
    }
  }, [timeRange, startTime, endTime]);

  const getTimeRangeOptions = () => {
    return defaultTimeRangeOptions;
  };

  return (
    <TimeRangeContext.Provider
      value={{
        timeRange,
        updateTimeRange,
        updateCustomTimeRange,
        updateCustomTillNowTimeRange,
        getTimeRangeOptions,
        getTimeRange
      }}
    >
      {children}
    </TimeRangeContext.Provider>
  );
};

export default TimeRangeContext;
