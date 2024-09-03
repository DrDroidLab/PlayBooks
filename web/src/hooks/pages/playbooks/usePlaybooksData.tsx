import { useState } from "react";
import { COPY_LOADING_DELAY } from "../../../constants";
import { copyPlaybook } from "../../../store/features/playbook/playbookSlice";
import { useLazyGetPlaybookQuery } from "../../../store/features/playbook/api";
import { useDispatch } from "react-redux";
import useToggle from "../../common/useToggle";
import { Link, useNavigate } from "react-router-dom";
import { ContentCopyRounded, DeleteRounded } from "@mui/icons-material";
import { renderTimestamp } from "../../../utils/common/dateUtils";

export const usePlaybooksData = (data: any[]) => {
  const navigate = useNavigate();
  const [selectedPlaybook, setSelectedPlaybook] = useState({});
  const [triggerGetPlaybook] = useLazyGetPlaybookQuery();
  const [copyLoading, setCopyLoading] = useState(false);
  const dispatch = useDispatch();
  const { isOpen: isActionOpen, toggle } = useToggle();

  const handleDeletePlaybook = (playbook) => {
    setSelectedPlaybook(playbook);
    toggle();
  };

  const handleCopyPlaybook = async (id) => {
    setCopyLoading(true);
    const res = await triggerGetPlaybook({ playbookId: id }).unwrap();
    dispatch(copyPlaybook({ pb: res }));
    setTimeout(() => {
      navigate("/playbooks/create");
    }, COPY_LOADING_DELAY);
  };

  const actions = [
    {
      icon: <ContentCopyRounded />,
      label: "Copy",
      action: (item) => handleCopyPlaybook(item.id),
      tooltip: "Copy this Playbook",
    },
    {
      icon: <DeleteRounded />,
      label: "Delete",
      action: (item) => handleDeletePlaybook(item),
      tooltip: "Remove this Playbook",
    },
  ];

  const rows = data?.map((item: any) => ({
    ...item,
    name: (
      <Link
        to={`/playbooks/${item.id}`}
        className="text-violet-500 hover:text-violet-800 transition-all">
        {item.name}
      </Link>
    ),
    createdAt: renderTimestamp(item.created_at),
    createdBy: item.created_by,
  }));

  return {
    rows,
    actions,
    selectedPlaybook,
    copyLoading,
    isActionOpen,
    toggle,
  };
};

export default usePlaybooksData;
