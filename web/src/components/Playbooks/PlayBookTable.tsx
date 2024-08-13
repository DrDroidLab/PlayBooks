import { Link, useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { ContentCopy } from "@mui/icons-material";
import PlaybookActionOverlay from "./PlaybookActionOverlay.tsx";
import NoExistingPlaybook from "./NoExistingPlaybook.js";
import { renderTimestamp } from "../../utils/common/dateUtils.ts";
import useToggle from "../../hooks/common/useToggle.js";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { copyPlaybook } from "../../store/features/playbook/playbookSlice.ts";
import { useLazyGetPlaybookQuery } from "../../store/features/playbook/api/index.ts";
import Loading from "../common/Loading/index.tsx";
import { COPY_LOADING_DELAY } from "../../constants/index.ts";
import CustomTable from "../common/Table/index.tsx";

const PlaybookTable = ({ data, refreshTable }) => {
  const navigate = useNavigate();
  const { isOpen: isActionOpen, toggle } = useToggle();
  const [selectedPlaybook, setSelectedPlaybook] = useState({});
  const [triggerGetPlaybook] = useLazyGetPlaybookQuery();
  const dispatch = useDispatch();
  const [copyLoading, setCopyLoading] = useState(false);

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

  if (copyLoading) {
    return <Loading title="Copying your playbook..." />;
  }

  const columns = [
    { header: "Name", key: "name", isMain: true },
    { header: "Created At", key: "createdAt" },
    { header: "Created By", key: "createdBy" },
  ];

  const rows = data?.map((item) => ({
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

  const actions = [
    {
      icon: <ContentCopy />,
      label: "Copy",
      action: (item) => handleCopyPlaybook(item.id),
      tooltip: "Copy this Playbook",
    },
    {
      icon: <DeleteIcon />,
      label: "Delete",
      action: (item) => handleDeletePlaybook(item),
      tooltip: "Remove this Playbook",
    },
  ];

  return (
    <>
      <CustomTable columns={columns} rows={rows} actions={actions} />
      {!data?.length ? <NoExistingPlaybook /> : null}
      <PlaybookActionOverlay
        playbook={selectedPlaybook}
        isOpen={isActionOpen}
        toggleOverlay={toggle}
        refreshTable={refreshTable}
      />
    </>
  );
};

export default PlaybookTable;
