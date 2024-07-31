export const isCSV = (str: string) => {
  const values = str.split(",");
  return values.length > 1;
};
