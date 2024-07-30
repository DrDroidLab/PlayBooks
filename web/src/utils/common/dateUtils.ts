export const renderTimestamp = (timestamp: number) => {
  // Create a Date object from the UNIX timestamp (timestamp is assumed to be in seconds)
  const date = new Date(timestamp * 1000);

  // Use Intl.DateTimeFormat for formatting the date
  // Customize options as needed to match the desired format 'YYYY-MM-DD HH:mm:ss'
  const options: any = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  // Create an Intl.DateTimeFormat instance with the desired options and locale ('en-US' used here as an example)
  const formatter = new Intl.DateTimeFormat("en-US", options);

  // Format the date
  const formattedDate = formatter.format(date);

  // Since Intl.DateTimeFormat returns the date in the format 'MM/DD/YYYY, HH:mm:ss' for 'en-US' locale,
  // we need to rearrange the formatted string to match 'YYYY-MM-DD HH:mm:ss'
  const parts = formattedDate.split(", ");
  const datePart = parts[0].split("/");
  const timePart = parts[1];

  // Rearrange and format the string
  return `${datePart[2]}-${datePart[0]}-${datePart[1]} ${timePart}`;
};

export const isDate = (date) => {
  if (date.length < 10) return false;

  // Regular expression to match date formats like YYYY-MM-DD, YYYY/MM/DD, etc.
  const datePattern =
    /^\d{4}[-/]\d{2}[-/]\d{2}([ T]\d{2}:\d{2}:\d{2}(\.\d{1,6})?)?$/;

  // Check if the string matches the date pattern
  if (!datePattern.test(date)) {
    return false;
  }

  const d = new Date(date);
  return d instanceof Date && !isNaN(d.valueOf());
};
