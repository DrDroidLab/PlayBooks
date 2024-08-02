export const extractTimeFromHours = (hours: string): string => {
  return (parseInt(hours, 10) * 3600).toString();
};
