const getCurrentTimeStamp = () => {
  return Math.floor(Date.now() / 1000);
};

export const defaultTimeRangeOptions = {
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

export const playbooksTimeRangeOptions = {
  Custom: {
    displayLabel: 'Custom'
  },
  CustomTillNow: {
    displayLabel: 'Custom till now'
  }
};
