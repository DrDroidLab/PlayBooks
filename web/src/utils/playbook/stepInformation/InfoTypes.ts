export const InfoTypes = {
  TEXT: "TEXT",
  CHIPS: "CHIPS",
} as const;

export type InfoType = (typeof InfoTypes)[keyof typeof InfoTypes];
