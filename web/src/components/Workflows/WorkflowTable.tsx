import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Link } from "react-router-dom";
import NoExistingPlaybook from "./NoExistingWorkflow.js";
import { renderTimestamp } from "../../utils/common/dateUtils.ts";
import { handleStatus } from "../../utils/common/handleStatus.tsx";
import WorkflowActions from "./WorkflowActions.tsx";

const WorkflowTable = ({ data, refreshTable }) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="!font-bold">Name</TableCell>
            <TableCell className="!font-bold">Playbooks</TableCell>
            <TableCell className="!font-bold">Schedule</TableCell>
            <TableCell className="!font-bold">Last Execution Time</TableCell>
            <TableCell className="!font-bold">Last Execution Status</TableCell>
            <TableCell className="!font-bold">Created by</TableCell>
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
              <TableCell component="th" scope="row">
                <Link
                  to={`/workflows/${item.id}`}
                  className="text-violet-500 underline">
                  {item.name}
                </Link>
              </TableCell>
              <TableCell component="td" scope="row" className="!text-center">
                {item.playbooks?.length > 0
                  ? item.playbooks.map((e) => (
                      <div
                        className="p-1 text-xs border rounded bg-gray-50 cursor-pointer w-fit transition-all"
                        key={e.id}>
                        <p>{e.name}</p>
                      </div>
                    ))
                  : "--"}
              </TableCell>
              <TableCell component="td" scope="row">
                <div className="flex flex-col text-xs gap-1">
                  <span className="text-sm font-bold">
                    {item.schedule?.type}
                  </span>
                  {item.schedule?.periodic?.cron_rule && (
                    <span className="border bg-gray-50 w-fit p-1 font-bold">
                      {item.schedule?.periodic?.cron_rule?.rule}
                    </span>
                  )}
                  {item.schedule?.periodic?.duration_in_seconds && (
                    <span className="border bg-gray-50 w-fit p-1">
                      For {item.schedule?.periodic?.duration_in_seconds} seconds
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell component="td" scope="row">
                {item.last_execution_time
                  ? renderTimestamp(item?.last_execution_time)
                  : "--"}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.last_execution_status
                  ? handleStatus(item.last_execution_status)
                  : "--"}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.created_by}
              </TableCell>
              <TableCell component="td" scope="row">
                <WorkflowActions item={item} refreshTable={refreshTable} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExistingPlaybook /> : null}
    </>
  );
};

export default WorkflowTable;
