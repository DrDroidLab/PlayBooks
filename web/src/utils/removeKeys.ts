export default function removeKeyFromObject(obj: any, key: string): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeKeyFromObject(item, key));
  } else if (obj !== null && typeof obj === "object") {
    const { [key]: omitted, ...rest } = obj;
    return Object.keys(rest).reduce((acc, k) => {
      acc[k] = removeKeyFromObject(rest[k], key);
      return acc;
    }, {} as any);
  }
  return obj;
}
