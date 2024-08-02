function extractDate(time: string): Date {
  if (time === "now") {
    return new Date();
  }

  const minutes = parseInt(time.split("-")[1]);
  const milliseconds = minutes * 60 * 1000;
  return new Date(Date.now() - milliseconds);
}

export const extractTime = (
  date: Date | string | undefined | null,
): number | undefined | null => {
  if (!date) return undefined;

  if (typeof date === "string") {
    return Math.round(extractDate(date).getTime() / 1000);
  }

  return Math.round(date.getTime() / 1000);
};
