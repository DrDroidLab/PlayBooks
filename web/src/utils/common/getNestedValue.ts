export default function getNestedValue(obj, keyPath, defaultValue = undefined) {
  // If the keyPath is a single key (no dot notation), return the value directly.
  if (!keyPath.includes(".")) {
    return obj[keyPath] !== undefined ? obj[keyPath] : defaultValue;
  }

  // Split the keyPath and reduce to get the nested value.
  return keyPath.split(".").reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : defaultValue;
  }, obj);
}
