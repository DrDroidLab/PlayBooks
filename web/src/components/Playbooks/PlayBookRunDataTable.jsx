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

import SeeMoreText from "./SeeMoreText";

const PlayBookRunDataTable = ({ title, result, timestamp }) => {
  const [showTable, setShowTable] = useState(false);
  const [open, setOpen] = useState(false);

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (
      result &&
      result.table &&
      result.table.rows &&
      result.table.rows.length > 0
    ) {
      setTableData(result.table.rows);
      setShowTable(true);
    }
  }, [result]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className={styles["graph-box"]}>
      <p className={styles["graph-title"]}>{title}</p>
      {!showTable && <p className={styles["graph-error"]}>No data available</p>}
      {showTable && (
        <Table stickyHeader className={styles["tableData"]}>
          <TableHead>
            <TableRow>
              {tableData[0]?.columns
                ?.filter((x) => x.name !== "@ptr")
                .map((col, index) => {
                  return (
                    <TableCell className={styles["tableLogDataTitle"]}>
                      {col.name}
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
                          className={
                            col.name === "@message"
                              ? styles["tableDataMsg"]
                              : styles["tableData"]
                          }>
                          <SeeMoreText
                            title={col.name}
                            text={col.value}
                            truncSize={200}
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

export default PlayBookRunDataTable;
