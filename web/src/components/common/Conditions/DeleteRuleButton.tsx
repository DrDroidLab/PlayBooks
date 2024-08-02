import { useSelector } from "react-redux";
import useIsPrefetched from "../../../hooks/playbooks/useIsPrefetched";
import CustomButton from "../CustomButton";
import { DeleteRounded } from "@mui/icons-material";
import { additionalStateSelector } from "../../../store/features/drawers/selectors";
import useEdgeConditions from "../../../hooks/playbooks/useEdgeConditions";
import { RuleType } from "./types";

type DeleteRuleButtonProps = {
  ruleIndex: number;
  ruleType: RuleType;
};

function DeleteRuleButton({ ruleIndex, ruleType }: DeleteRuleButtonProps) {
  const { id } = useSelector(additionalStateSelector);
  const isPrefetched = useIsPrefetched();
  const { handleDeleteRule } = useEdgeConditions(id);

  const handleDelete = () => {
    handleDeleteRule(ruleType, ruleIndex);
  };

  if (isPrefetched) return;

  return (
    <div className="flex gap-2 flex-wrap">
      <CustomButton className="!text-sm !w-fit" onClick={handleDelete}>
        <DeleteRounded fontSize="inherit" />
      </CustomButton>
    </div>
  );
}

export default DeleteRuleButton;
