/**
 * Checks if the input string is a valid date string in formats like YYYY-MM-DD, YYYY/MM/DD, etc.
 *
 * @param {string} date - The string to be checked for date validity.
 * @return {boolean} Returns true if the input string is a valid date, otherwise false.
 */
export const isDate = (date: string): boolean => {
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
