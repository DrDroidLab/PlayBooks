import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { renderTimestamp } from "../../utils/DateUtils.js";
import PaginatedTable from "../PaginatedTable.js";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { Link, useNavigate } from "react-router-dom";
import NoExistingPlaybook from "./NoExistingWorkflow.jsx";
import useToggle from "../../hooks/useToggle.js";
import PlaybookActionOverlay from "./WorkflowActionOverlay.jsx";
import { ContentCopy } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { copyPlaybook } from "../../store/features/playbook/playbookSlice.ts";
import { useLazyGetPlaybookQuery } from "../../store/features/playbook/api/index.ts";

const PlaybookTableRender = ({ data, refreshTable, showDelete = true }) => {
  const navigate = useNavigate();
  const { isOpen: isActionOpen, toggle } = useToggle();
  const [selectedPlaybook, setSelectedPlaybook] = useState({});
  const [triggerGetPlaybook] = useLazyGetPlaybookQuery();
  const dispatch = useDispatch();

  const handleDeletePlaybook = (playbook) => {
    setSelectedPlaybook(playbook);
    toggle();
  };

  const handleCopyPlaybook = async (id) => {
    const res = await triggerGetPlaybook({ playbookId: id }).unwrap();
    dispatch(copyPlaybook(res));
    navigate("/playbooks/create");
  };

  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Created At</TableCell>
            {showDelete && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow
              key={index}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}>
              <TableCell component="th" scope="row">
                <Link to={`/playbooks/${item.id}`}>{item.name}</Link>
              </TableCell>
              <TableCell component="th" scope="row">
                {renderTimestamp(item.created_at)}
              </TableCell>
              {showDelete && (
                <TableCell component="th" scope="row">
                  <div className="flex gap-2">
                    <button onClick={() => handleCopyPlaybook(item.id)}>
                      <Tooltip title="Copy this Playbook">
                        <ContentCopy />
                      </Tooltip>
                    </button>
                    <button onClick={() => handleDeletePlaybook(item)}>
                      <Tooltip title="Remove this Playbook">
                        <DeleteIcon />
                      </Tooltip>
                    </button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
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

const PlaybookTable = ({
  playbookList,
  total,
  pageSize,
  pageUpdateCb,
  tableContainerStyles,
  refreshTable,
  showDelete,
}) => {
  return (
    <PaginatedTable
      renderTable={PlaybookTableRender}
      data={playbookList ?? []}
      showDelete={showDelete}
      total={total}
      pageSize={pageSize}
      pageUpdateCb={pageUpdateCb}
      tableContainerStyles={tableContainerStyles ? tableContainerStyles : {}}
      refreshTable={refreshTable}
    />
  );
};

export default PlaybookTable;
