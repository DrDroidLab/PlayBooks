import React from "react";
import PlaybookAPIActionOutput from "./PlaybookAPIActionOutput";
import PlaybookBashActionOutput from "./PlaybookBashActionOutput";

function PlaybookActionOutput({ result }) {
  if (result.api_response) {
    return <PlaybookAPIActionOutput output={result.api_response} />;
  }
  if (result.bash_command_output) {
    return <PlaybookBashActionOutput output={result.bash_command_output} />;
  }
}

export default PlaybookActionOutput;
