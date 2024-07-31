import { CUSTOM_KEY } from "./constants";

export const injectTimeRangeIdFromSeconds = (seconds: string): string => {
  const secondsInInt = parseInt(seconds, 10);
  const hours = secondsInInt / 3600;
  switch (hours) {
    case 24:
      return "now-24";
    case 168:
      return "now-168";
    default:
      return CUSTOM_KEY;
  }
};

export default injectTimeRangeIdFromSeconds;
