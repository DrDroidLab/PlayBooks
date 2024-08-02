import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched";
import SavePlaybookButton from "../../Buttons/SavePlaybookButton";

function CommonConditionBottom() {
  const isPrefetched = useIsPrefetched();

  return <div className="m-2">{!!isPrefetched && <SavePlaybookButton />}</div>;
}

export default CommonConditionBottom;
