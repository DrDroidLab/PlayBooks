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

const ExecutionsTableRender = ({ data }) => {
  return (
    <>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell className="!font-bold">Name</TableCell>
            <TableCell className="!font-bold !text-center">Playbooks</TableCell>
            <TableCell className="!font-bold">Schedule</TableCell>
            <TableCell className="!font-bold !text-center ">
              Last Execution Time
            </TableCell>
            <TableCell className="!font-bold !text-center">
              Last Execution Status
            </TableCell>
            <TableCell className="!font-bold">Created by</TableCell>
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
                --
              </TableCell>
              <TableCell component="td" scope="row">
                {item.schedule?.type}
              </TableCell>
              <TableCell component="td" scope="row" className="!text-center">
                --
              </TableCell>
              <TableCell component="td" scope="row" className="!text-center">
                --
              </TableCell>
              <TableCell component="td" scope="row">
                {item.created_by}
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
  workflowsList,
  total,
  pageSize,
  pageUpdateCb,
  tableContainerStyles,
}) => {
  return (
    <PaginatedTable
      renderTable={ExecutionsTableRender}
      data={workflowsList ?? []}
      total={total}
      pageSize={pageSize}
      pageUpdateCb={pageUpdateCb}
      tableContainerStyles={tableContainerStyles ? tableContainerStyles : {}}
    />
  );
};

export default ExecutionsTable;
