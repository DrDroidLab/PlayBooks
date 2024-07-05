export const InputTypes = {
  TEXT: "TEXT",
  TEXT_ROW: "TEXT_ROW",
  MULTILINE: "MULTILINE",
  BUTTON: "BUTTON",
  IFRAME_RENDER: "IFRAME_RENDER",
  TYPING_DROPDOWN: "TYPING_DROPDOWN",
} as const;

export type InputType = (typeof InputTypes)[keyof typeof InputTypes];
