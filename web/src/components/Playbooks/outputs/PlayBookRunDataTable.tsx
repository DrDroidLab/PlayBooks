import { useState, useEffect } from "react";
import styles from "./index.module.css";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
} from "@mui/material";

import SeeMoreTextWithoutModal from "../../common/SeeMoreTextWithoutModal/index.tsx";
import { isDate, renderTimestamp } from "../../../utils/common/dateUtils.ts";

const PlayBookRunDataTable = ({ title, result, timestamp, showHeading }) => {
  const [showTable, setShowTable] = useState(false);
  const [open, setOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  const [tableData, setTableData] = useState<any>([]);

  useEffect(() => {
    if (
      result &&
      result.table &&
      result.table.rows &&
      result.table.rows.length > 0
    ) {
      setShowTable(true);
      setTableData(result.table.rows);
      setTableLoading(false);
    }
  }, [result]);

  const handleClose = () => {
    setOpen(false);
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
              {tableData[0]?.columns
                ?.filter((x) => x.name !== "@ptr")
                .map((col, index) => {
                  return (
                    <TableCell
                      key={index}
                      className="!w-fit !min-w-[50px] !max-w-[200px] !border">
                      <SeeMoreTextWithoutModal
                        text={col.name}
                        maxLength={50}
                        className={"font-bold text-xs"}
                      />
                    </TableCell>
                  );
                })}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData?.map((row, rowIndex) => {
              return (
                <TableRow key={rowIndex}>
                  {row?.columns
                    ?.filter((x) => x.name !== "@ptr")
                    .map((col, colIndex) => {
                      return (
                        <TableCell
                          key={colIndex}
                          className={`${
                            col.name === "@message"
                              ? "min-w-[100px]"
                              : "min-w-[50px]"
                          } !text-xs !border !min-w-[max-content]`}>
                          <SeeMoreTextWithoutModal
                            text={
                              isDate(col.value)
                                ? renderTimestamp(
                                    new Date(col.value).getTime() / 1000,
                                  )
                                : col.value
                            }
                            maxLength={200}
                          />
                        </TableCell>
                      );
                    })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      {!showTable && timestamp && (
        <p className={styles["graph-ts-error"]}>
          <i>Updated at: {renderTimestamp(timestamp)}</i>
        </p>
      )}
      {showTable && timestamp && (
        <p className={styles["graph-ts"]}>
          <i>Updated at: {renderTimestamp(timestamp)}</i>
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

export default PlayBookRunDataTable;
