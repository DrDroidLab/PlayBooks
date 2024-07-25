export default function setNestedValue(obj: any, path: string, value: any) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];

    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new Error("Invalid key to prevent prototype pollution");
    }

    if (!isNaN(parseInt(nextKey))) {
      // If next key is a numeric value
      if (!current[key] || !Array.isArray(current[key])) {
        current[key] = [];
      }
    } else {
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
    }

    current = current[key];
  }

  const lastKey = keys[keys.length - 1];
  if (
    lastKey === "__proto__" ||
    lastKey === "constructor" ||
    lastKey === "prototype"
  ) {
    throw new Error("Invalid key to prevent prototype pollution");
  }

  if (!isNaN(parseInt(lastKey))) {
    current[parseInt(lastKey)] = value;
  } else {
    current[lastKey] = value;
  }

  return obj;
}
