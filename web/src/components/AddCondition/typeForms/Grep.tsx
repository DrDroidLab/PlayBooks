import React from "react";
import { HandleTypesPropTypes } from "../HandleTypes.tsx";
import { GrepRuleTypes } from "../../../utils/conditionals/types/grepRuleTypes.ts";
import GrepCount from "./grepForms/GrepCount.tsx";

function Grep(props: HandleTypesPropTypes) {
  const { rule } = props;
  const grepRuleType = rule?.type_id;

  switch (grepRuleType) {
    case GrepRuleTypes.GREP_EXISTS:
    case GrepRuleTypes.GREP_DOES_NOT_EXIST:
      return <></>;

    case GrepRuleTypes.GREP_COUNT:
      return <GrepCount {...props} />;

    default:
      return <></>;
  }
}

export default Grep;
