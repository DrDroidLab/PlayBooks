import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Link } from "react-router-dom";
import NoExisting from "./NoExisting.tsx";
import useToggle from "../../../hooks/common/useToggle.ts";
import { renderTimestamp } from "../../../utils/common/dateUtils.ts";
import DynamicAlertActions from "./DynamicAlertActions.tsx";
import { handleStatus } from "../../../utils/common/handleStatus.tsx";

const DynamicAlertsTable = ({ data }) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="!font-bold">Name</TableCell>
            <TableCell className="!font-bold">Created At</TableCell>
            <TableCell className="!font-bold">Created By</TableCell>
            <TableCell className="!font-bold">Started At</TableCell>
            <TableCell className="!font-bold">Status</TableCell>
            <TableCell className="!font-bold">Actions</TableCell>
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
              <TableCell component="td" scope="row">
                {item.last_execution_time
                  ? renderTimestamp(item.last_execution_time)
                  : "--"}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.last_execution_status
                  ? handleStatus(item.last_execution_status)
                  : "--"}
              </TableCell>
              <TableCell component="td" scope="row">
                <DynamicAlertActions item={item} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExisting /> : null}
    </>
  );
};

export default DynamicAlertsTable;
