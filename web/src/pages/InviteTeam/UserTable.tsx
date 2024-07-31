import {
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import styles from "./index.module.css";
import React from "react";

const UserTable = ({ data, loading }) => {
  return (
    <>
      {loading ? <LinearProgress /> : null}
      <Table stickyHeader className="bg-white">
        <TableHead>
          <TableRow>
            <TableCell className={styles["tableTitle"]}>Name</TableCell>
            <TableCell className={styles["tableTitle"]}>Email</TableCell>
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
                {item.first_name + " " + item.last_name}
              </TableCell>
              <TableCell component="th" scope="row">
                {item.email}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default UserTable;
