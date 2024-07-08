export const InputTypes = {
  TEXT: "TEXT",
  TEXT_ROW: "TEXT_ROW",
  MULTILINE: "MULTILINE",
  BUTTON: "BUTTON",
  IFRAME_RENDER: "IFRAME_RENDER",
  DROPDOWN: "DROPDOWN",
  TYPING_DROPDOWN: "TYPING_DROPDOWN",
  TYPING_DROPDOWN_MULTIPLE: "TYPING_DROPDOWN_MULTIPLE",
} as const;

export type InputType = (typeof InputTypes)[keyof typeof InputTypes];
