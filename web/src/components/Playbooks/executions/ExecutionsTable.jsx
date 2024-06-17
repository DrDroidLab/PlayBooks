import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import PaginatedTable from "../../PaginatedTable.js";
import { Link } from "react-router-dom";
import NoExistingPlaybook from "./NoExistingExecution.jsx";
import { renderTimestamp } from "../../../utils/DateUtils.js";
import { handleStatus } from "../../../utils/handleStatus.tsx";
import handleToolLogos from "../../../utils/handleToolLogos.ts";

const ExecutionsTableRender = ({ data }) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="!font-bold">Run ID</TableCell>
            <TableCell className="!font-bold">Playbook</TableCell>
            <TableCell className="!font-bold">Tools</TableCell>
            <TableCell className="!font-bold">Status</TableCell>
            <TableCell className="!font-bold">Executed At</TableCell>
            <TableCell className="!font-bold">Finsihed By</TableCell>
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
                  {item.playbook_run_id}
                </Link>
              </TableCell>
              <TableCell component="td" scope="row">
                <Link
                  to={`/playbooks/${item.playbook.id}`}
                  className="text-violet-500 underline">
                  {item.playbook?.name}
                </Link>
              </TableCell>
              <TableCell component="th" scope="row">
                <div className="flex gap-1 items-center">
                  {handleToolLogos(item.playbook).map((tool) => (
                    <Tooltip title={tool.name}>
                      <img
                        src={tool.image}
                        alt={tool.name}
                        width={25}
                        height={25}
                      />
                    </Tooltip>
                  ))}
                </div>
              </TableCell>
              <TableCell component="th" scope="row">
                {handleStatus(item.status)}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.finished_at ?? item.created_at
                  ? renderTimestamp(item.finished_at ?? item.created_at)
                  : "--"}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.created_by}
              </TableCell>
              <TableCell component="td" scope="row">
                <Link
                  to={`/playbooks/${item.playbook.id}?executionId=${item.playbook_run_id}`}>
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
