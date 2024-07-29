import { useRef } from "react";

type Dimensions = {
  width: number | undefined;
  height: number | undefined;
};

type DimensionsReturnType = [React.RefObject<HTMLElement>, Dimensions];

function useDimensions(): DimensionsReturnType {
  const ref = useRef<HTMLElement>(null);

  const width: number | undefined = ref.current?.clientWidth;
  const height: number | undefined = ref.current?.clientHeight;

  return [
    ref,
    {
      width,
      height,
    },
  ];
}

export default useDimensions;
