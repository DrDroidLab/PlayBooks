import React, { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import NProgress from "nprogress";

type LoadingPropTypes = {
  title?: string;
};

function Loading({ title }: LoadingPropTypes) {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done(); // Stop nprogress when component is unmounted
    };
  }, []);

  return (
    <div className="absolute z-10 top-0 left-0 w-full h-screen flex flex-col gap-2 items-center justify-center bg-white text-black">
      {title}
      <CircularProgress color="primary" />
    </div>
  );
}

export default Loading;
