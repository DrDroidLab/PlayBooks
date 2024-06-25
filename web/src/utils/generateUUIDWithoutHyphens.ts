import { v4 as uuidv4 } from "uuid";

export default function generateUUIDWithoutHyphens() {
  return uuidv4().replace(/-/g, "");
}
