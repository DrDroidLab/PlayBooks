export const InfoTypes = {
  TEXT: "TEXT",
  CHIPS: "CHIPS",
  MARKDOWN: "MARKDOWN",
} as const;

export type InfoType = (typeof InfoTypes)[keyof typeof InfoTypes];
