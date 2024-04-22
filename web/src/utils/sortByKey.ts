export function sortByKey(arr, key) {
  return arr.slice().sort((a, b) => {
    const valueA = a[key].toLowerCase();
    const valueB = b[key].toLowerCase();

    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;
  });
}
