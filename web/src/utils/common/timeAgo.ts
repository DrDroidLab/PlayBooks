export const timeAgo = (seconds: number): string => {
  const units: { [key: string]: number } = {
    year: 365 * 24 * 60 * 60,
    month: 30 * 24 * 60 * 60,
    week: 7 * 24 * 60 * 60,
    day: 24 * 60 * 60,
    hour: 60 * 60,
    minute: 60,
    second: 1,
  };

  for (const unit in units) {
    const unitSeconds = units[unit];
    if (seconds >= unitSeconds) {
      const value = Math.floor(seconds / unitSeconds);
      return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};
