import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched";
import SavePlaybookButton from "../../Buttons/SavePlaybookButton";

function CommonConditionBottom() {
  const isPrefetched = useIsPrefetched();

  return <div>{!isPrefetched && <SavePlaybookButton />}</div>;
}

export default CommonConditionBottom;
