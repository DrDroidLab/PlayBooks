import { useState, useEffect } from "react";
import styles from "./index.module.css";

import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  Collapse,
  Button,
  Dialog,
  DialogActions,
} from "@mui/material";

import { ArrowRightRounded } from "@mui/icons-material";
import SeeMoreTextWithoutModal from "../common/SeeMoreTextWithoutModal/index.tsx";
import { isDate, renderTimestamp } from "../../utils/DateUtils.js";
import Code from "../common/Code/index.tsx";
import React from "react";
import transformLogData from "../../utils/execution/transformLogData.ts";

const PlayBookRunLogTable = ({ title, result, timestamp, showHeading }) => {
  const [showTable, setShowTable] = useState(false);
  const [open, setOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const rows = result?.table?.rows;

  useEffect(() => {
    if (rows?.length > 0) setShowTable(true);
    setTableLoading(false);
  }, [rows]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleRowClick = (rowIndex) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  if (tableLoading)
    return (
      <div>
        <p className="text-xs font-semibold">Loading...</p>
      </div>
    );

  return (
    <div
      className={`${
        showHeading ? "h-full" : "h-auto"
      } border p-2 rounded mb-1 overflow-auto`}>
      <p className={styles["graph-title"]}>{title}</p>
      {!showTable && <p className={styles["graph-error"]}>No data available</p>}
      {showTable && (
        <Table
          stickyHeader
          className={`text-xs min-w-[50px] !border !rounded !overflow-hidden mt-2 h-full`}>
          <TableHead>
            <TableRow>
              <th className="!w-fit !border" />
              {rows?.[0]?.columns
                ?.filter((x) => x.name !== "@ptr")
                .map((col, index) => {
                  return (
                    <th
                      key={index}
                      className="!w-[200px] !border text-left p-2">
                      <SeeMoreTextWithoutModal
                        text={col.name}
                        maxLength={50}
                        className="font-bold text-xs"
                      />
                    </th>
                  );
                })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row, rowIndex) => {
              return (
                <>
                  <tr key={rowIndex} onClick={() => handleRowClick(rowIndex)}>
                    <td>
                      <ArrowRightRounded
                        fontSize="large"
                        className={`${
                          expandedRows[rowIndex] ? "rotate-90" : "rotate-0"
                        } text-gray-500`}
                      />
                    </td>
                    {row?.columns
                      ?.filter((x) => x.name !== "@ptr")
                      .map((col, colIndex) => {
                        const colValue = isDate(col.value)
                          ? renderTimestamp(
                              new Date(col.value).getTime() / 1000,
                            )
                          : col.value;
                        return (
                          <td
                            key={colIndex}
                            className={`w-[200px] text-xs p-2`}>
                            <p className="text-ellipsis overflow-hidden whitespace-nowrap max-w-sm p-0 font-medium">
                              {colValue}
                            </p>
                          </td>
                        );
                      })}
                  </tr>
                  <tr className="p-0">
                    <td />
                    <td colSpan={2}>
                      <Collapse
                        in={expandedRows[rowIndex]}
                        timeout="auto"
                        className="max-w-[550px] p-2 relative"
                        unmountOnExit>
                        <Code
                          content={JSON.stringify(
                            transformLogData(row),
                            null,
                            2,
                          )}
                        />
                      </Collapse>
                    </td>
                  </tr>
                </>
              );
            })}
          </TableBody>
        </Table>
      )}
      {!showTable && timestamp && (
        <p className={styles["graph-ts-error"]}>
          <i>Updated at: {timestamp}</i>
        </p>
      )}
      {showTable && timestamp && (
        <p className={styles["graph-ts"]}>
          <i>Updated at: {timestamp}</i>
        </p>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PlayBookRunLogTable;
