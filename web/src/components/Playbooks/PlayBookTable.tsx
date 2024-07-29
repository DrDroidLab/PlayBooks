import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { renderTimestamp } from "../../utils/common/dateUtils.ts";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import { Link, useNavigate } from "react-router-dom";
import NoExistingPlaybook from "./NoExistingPlaybook.js";
import styles from "./playbooks.module.css";
import useToggle from "../../hooks/common/useToggle.js";
import { ContentCopy } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { copyPlaybook } from "../../store/features/playbook/playbookSlice.ts";
import { useLazyGetPlaybookQuery } from "../../store/features/playbook/api/index.ts";
import Loading from "../common/Loading/index.tsx";
import { COPY_LOADING_DELAY } from "../../constants/index.ts";
import CustomButton from "../common/CustomButton/index.tsx";
import PlaybookActionOverlay from "./PlaybookActionOverlay.tsx";

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

  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className={styles["tableTitle"]}>Name</TableCell>
            <TableCell className={styles["tableTitle"]}>Created At</TableCell>
            <TableCell className={styles["tableTitle"]}>Created By</TableCell>
            <TableCell className={styles["tableTitle"]}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((item, index) => (
            <TableRow
              key={index}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}>
              <TableCell component="td" scope="row">
                <Link to={`/playbooks/${item.id}`}>{item.name}</Link>
              </TableCell>
              <TableCell component="td" scope="row">
                {renderTimestamp(item.created_at)}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.created_by}
              </TableCell>
              <TableCell component="td" scope="row">
                <div className="flex gap-2">
                  <CustomButton onClick={() => handleCopyPlaybook(item.id)}>
                    <Tooltip title="Copy this Playbook">
                      <ContentCopy />
                    </Tooltip>
                  </CustomButton>
                  <CustomButton onClick={() => handleDeletePlaybook(item)}>
                    <Tooltip title="Remove this Playbook">
                      <DeleteIcon />
                    </Tooltip>
                  </CustomButton>
                </div>
              </TableCell>
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

export default PlaybookTable;
