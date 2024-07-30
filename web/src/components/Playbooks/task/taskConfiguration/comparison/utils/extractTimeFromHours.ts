export const extractTimeFromHours = (hours: string): string => {
  return (parseInt(hours, 10) * 60).toString();
};
