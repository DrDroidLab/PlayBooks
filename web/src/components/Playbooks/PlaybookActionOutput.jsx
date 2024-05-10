import React from "react";
import PlaybookAPIActionOutput from "./PlaybookAPIActionOutput";

function PlaybookActionOutput({ result }) {
  if (result.api_response) {
    return <PlaybookAPIActionOutput output={result.api_response} />;
  }
}

export default PlaybookActionOutput;
