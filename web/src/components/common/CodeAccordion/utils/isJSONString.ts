export default function isJSONString(str: string | JSON) {
  if (typeof str !== "string") return false;
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
