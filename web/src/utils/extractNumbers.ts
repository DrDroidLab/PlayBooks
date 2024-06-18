export default function extractNumbers(input: string) {
  if (!input) return [];
  // Use regular expression to match numbers in the string
  const numbers = input.match(/\d+/g);

  // Convert the matched strings to integers
  const result = numbers ? numbers.map(Number) : [];

  return result;
}
