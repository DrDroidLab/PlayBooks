import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import { Link } from "react-router-dom";
import NoExisting from "./NoExisting.tsx";
import useToggle from "../../../hooks/common/useToggle.ts";
import { renderTimestamp } from "../../../utils/common/dateUtils.ts";
import CustomButton from "../../common/CustomButton/index.tsx";
import ActionOverlay from "./ActionOverlay.tsx";

const DynamicAlertsTable = ({ data }) => {
  const { isOpen: isActionOpen, toggle } = useToggle();

  const handleDeleteDynamicAlert = () => {
    toggle();
  };

  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="!font-bold">Name</TableCell>
            <TableCell className="!font-bold">Created At</TableCell>
            <TableCell className="!font-bold">Created By</TableCell>
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
                <Link
                  to={`/dynamic-alerts/${item.id}`}
                  className="text-violet-500 underline">
                  {item.name}
                </Link>
              </TableCell>
              <TableCell component="td" scope="row">
                {renderTimestamp(item.created_at)}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.created_by}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExisting /> : null}
      <ActionOverlay isOpen={isActionOpen} toggleOverlay={toggle} />
    </>
  );
};

export default DynamicAlertsTable;
