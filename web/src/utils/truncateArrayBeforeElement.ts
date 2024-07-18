export default function truncateArrayBeforeElement<T>(
  array: T[],
  element: T,
): T[] {
  const index = array.indexOf(element) + 1;
  if (index !== -1) {
    return array.slice(index);
  }
  return [];
}
