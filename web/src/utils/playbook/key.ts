export const Key = {
  METHOD: "method",
  URL: "url",
  HEADERS: "headers",
  PAYLOAD: "payload",
  TIMEOUT: "timeout",
} as const;

export type KeyType = (typeof Key)[keyof typeof Key];
