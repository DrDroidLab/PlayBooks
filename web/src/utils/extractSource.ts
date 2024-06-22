export default function extractSource(input: string): string {
  if (!input) return "";

  const split = input.split("-");

  switch (split.length) {
    case 0:
      return "";
    default:
      return split[split.length - 1];
  }
}
