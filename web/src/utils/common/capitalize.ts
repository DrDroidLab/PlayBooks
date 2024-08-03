/**
 * Capitalizes the first letter of a given string.
 *
 * @param {string} string - The input string to be capitalized.
 * @return {string} The input string with the first letter capitalized.
 */
export default function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
