import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import PaginatedTable from "../../PaginatedTable.js";
import { Link } from "react-router-dom";
import NoExistingPlaybook from "./NoExistingExecution.jsx";
import { renderTimestamp } from "../../../utils/DateUtils.js";
import { handleStatus } from "../../../utils/handleStatus.tsx";

const ExecutionsTableRender = ({ data }) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="!font-bold">Playbook</TableCell>
            <TableCell className="!font-bold">Status</TableCell>
            <TableCell className="!font-bold">Executed At</TableCell>
            <TableCell className="!font-bold">Action</TableCell>
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
                  to={`/playbooks/${item.playbook.id}`}
                  className="text-violet-500 underline">
                  {item.playbook?.name}
                </Link>
              </TableCell>
              <TableCell component="th" scope="row">
                {handleStatus(item.status)}
              </TableCell>
              <TableCell component="td" scope="row">
                <Link
                  to={`/playbooks/logs/${item.playbook_run_id}`}
                  className="text-violet-500 underline">
                  {renderTimestamp(item.created_at)}
                </Link>
              </TableCell>
              <TableCell component="td" scope="row">
                <Link to={`/playbooks/logs/${item.playbook_run_id}`}>
                  <div className="border w-fit border-violet-500 text-violet-500 p-1 rounded hover:text-white hover:bg-violet-500 transition-all">
                    View Playbook Execution
                  </div>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExistingPlaybook /> : null}
    </>
  );
};

const ExecutionsTable = ({
  playbooksList,
  total,
  pageSize,
  pageUpdateCb,
  tableContainerStyles,
}) => {
  return (
    <PaginatedTable
      renderTable={ExecutionsTableRender}
      data={playbooksList ?? []}
      total={total}
      pageSize={pageSize}
      pageUpdateCb={pageUpdateCb}
      tableContainerStyles={tableContainerStyles ? tableContainerStyles : {}}
    />
  );
};

export default ExecutionsTable;
