import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import NoExistingPlaybook from "./NoExistingExecution.jsx";
import { renderTimestamp } from "../../../utils/common/dateUtils.ts";
import handleToolLogos from "../../../utils/playbook/handleToolLogos.ts";

const ExecutionsTable = ({ data }) => {
  return (
    <div className="bg-white">
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="!font-bold">Run ID</TableCell>
            <TableCell className="!font-bold">Playbook</TableCell>
            <TableCell className="!font-bold">Tools</TableCell>
            {/* <TableCell className="!font-bold">Status</TableCell> */}
            <TableCell className="!font-bold">Executed At</TableCell>
            <TableCell className="!font-bold">Executed By</TableCell>
            {/* <TableCell className="!font-bold">Action</TableCell> */}
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
                  to={`/playbooks/${item.playbook.id}?executionId=${item.playbook_run_id}`}
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
                    <Tooltip key={tool.name} title={tool.name}>
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
              {/* <TableCell component="th" scope="row">
                {handleStatus(item.status)}
              </TableCell> */}
              <TableCell component="td" scope="row">
                {item.finished_at ?? item.created_at
                  ? renderTimestamp(item.finished_at ?? item.created_at)
                  : "--"}
              </TableCell>
              <TableCell component="td" scope="row">
                {item.created_by}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!data?.length ? <NoExistingPlaybook /> : null}
    </div>
  );
};

export default ExecutionsTable;
