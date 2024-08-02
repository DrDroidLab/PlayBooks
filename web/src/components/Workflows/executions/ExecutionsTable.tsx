import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Link } from "react-router-dom";
import NoExistingPlaybook from "./NoExistingExecution.js";
import { renderTimestamp } from "../../../utils/common/dateUtils.ts";
import { handleStatus } from "../../../utils/common/handleStatus.tsx";

const ExecutionsTable = ({ data }) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="!font-bold">Run ID</TableCell>
            <TableCell className="!font-bold">Workflow</TableCell>
            <TableCell className="!font-bold">Playbooks</TableCell>
            <TableCell className="!font-bold">Started At</TableCell>
            <TableCell className="!font-bold">Status</TableCell>
            <TableCell className="!font-boldd">Actions</TableCell>
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
                <Link
                  to={`/workflows/logs/${item.workflow_run_id}`}
                  className="text-violet-500 underline">
                  {item.workflow_run_id}
                </Link>
              </TableCell>
              <TableCell component="td" scope="row">
                <Link
                  to={`/workflows/${item.workflow.id}`}
                  className="text-violet-500 underline">
                  {item.workflow?.name}
                </Link>
              </TableCell>
              <TableCell component="td" scope="row" className="!text-center">
                <div className="flex flex-wrap gap-2">
                  {item.workflow?.playbooks?.length > 0
                    ? item.workflow.playbooks.map((e) => (
                        <div
                          className="p-1 text-xs border rounded bg-gray-50 w-fit transition-all"
                          key={e.id}>
                          <div>{e.name}</div>
                        </div>
                      ))
                    : "--"}
                </div>
              </TableCell>
              <TableCell component="td" scope="row">
                {item.started_at ? renderTimestamp(item.started_at) : "--"}
              </TableCell>
              <TableCell component="td" scope="row">
                {handleStatus(item.status)}
              </TableCell>
              <TableCell component="td" scope="row">
                <Link to={`/workflows/logs/${item.workflow_run_id}`}>
                  <div className="border w-fit border-violet-500 text-violet-500 p-1 rounded hover:text-white hover:bg-violet-500 transition-all">
                    View Playbook Executions
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

export default ExecutionsTable;
