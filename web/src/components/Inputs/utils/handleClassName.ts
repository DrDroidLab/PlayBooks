import { LabelPosition } from "../../../types/inputs/index.ts";

export const handleClassname = (position: LabelPosition) => {
  switch (position) {
    case LabelPosition.TOP:
      return "flex flex-col";
    case LabelPosition.BOTTOM:
      return "flex flex-col-reverse";
    case LabelPosition.LEFT:
      return "flex flex-row items-center gap-2";
    case LabelPosition.RIGHT:
      return "flex flex-row-reverse items-center gap-2";
  }
};
