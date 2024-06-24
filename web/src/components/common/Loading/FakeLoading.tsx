import React from "react";
import useFakeLoading from "../../../hooks/useFakeLoading.ts";
import Loading from "./index.tsx";

function FakeLoading() {
  const { isLoading, title } = useFakeLoading();

  if (isLoading) {
    return <Loading title={title} />;
  }

  return null;
}

export default FakeLoading;
