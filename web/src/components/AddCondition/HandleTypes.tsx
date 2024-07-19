import React from "react";
import Rolling from "./typeForms/Rolling.tsx";
import { RuleTypes } from "../../utils/conditionals/types/ruleTypes.ts";
import ColumnValue from "./typeForms/ColumnValue.tsx";
import GrepCount from "./typeForms/GrepCount.tsx";
import GrepExistence from "./typeForms/GrepExistence.tsx";

export type HandleTypesPropTypes = {
  condition: any;
  conditionIndex: number;
  rule: any;
};

function HandleTypes(props: HandleTypesPropTypes) {
  const type = props.rule?.type;

  switch (type) {
    case RuleTypes.ROLLING:
      return <Rolling {...props} />;
    case RuleTypes.COLUMN_VALUE:
      return <ColumnValue {...props} />;
    case RuleTypes.GREP_COUNT:
      return <GrepCount {...props} />;
    case RuleTypes.GREP:
      return <GrepExistence {...props} />;
    case RuleTypes.NO_GREP:
      return <GrepExistence {...props} />;
    default:
      return <></>;
  }
}

export default HandleTypes;
