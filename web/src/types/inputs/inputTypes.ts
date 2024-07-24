export const InputTypes = {
  TEXT: "TEXT",
  MULTILINE: "MULTILINE",
  BUTTON: "BUTTON",
  IFRAME_RENDER: "IFRAME_RENDER",
  DROPDOWN: "DROPDOWN",
  TYPING_DROPDOWN: "TYPING_DROPDOWN",
  TYPING_DROPDOWN_MULTIPLE: "TYPING_DROPDOWN_MULTIPLE",
  WYISWYG: "WYSIWYG",
} as const;

export type InputType = (typeof InputTypes)[keyof typeof InputTypes];
