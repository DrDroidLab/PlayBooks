import { useContext } from 'react';
import TimeRangeContext from '../context/TimeRangeProvider';

const useTimeRange = () => {
  return useContext(TimeRangeContext);
};

export default useTimeRange;
