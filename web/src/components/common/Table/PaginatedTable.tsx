/* eslint-disable react-hooks/exhaustive-deps */
import { Paper, TableContainer, TablePagination } from "@mui/material";
import { useState, useEffect } from "react";
import React from "react";
import usePagination from "../../../hooks/common/usePagination";
import CustomTable from ".";
import { PaginatedTableProps } from "./types";

const rowsPerPageOptions = [2, 5, 10, 25, 100];

const PaginatedTable = <T extends object>({
  columns,
  data,
  actions,
  total,
  tableContainerStyles = {},
}: PaginatedTableProps<T>) => {
  const { page, limit, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const [rows, setRows] = useState<T[]>(data);
  const [totalRows, setTotalRows] = useState(total);

  useEffect(() => {
    setRows(data);
    setTotalRows(total);
  }, [data, total]);

  // Map your data to the rows format required by CustomTable
  const mappedRows = rows.map((item) => {
    const row: Record<string, React.ReactNode> = {};
    columns.forEach((col) => {
      row[col.key as string] = item[col.key] as React.ReactNode;
    });
    return row;
  });

  return (
    <>
      <TableContainer
        component={Paper}
        className="!shadow-none !border"
        sx={tableContainerStyles}>
        <CustomTable columns={columns} rows={mappedRows} actions={actions} />
      </TableContainer>
      {limit ? (
        <TablePagination
          component="div"
          rowsPerPageOptions={rowsPerPageOptions}
          count={totalRows}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      ) : null}
    </>
  );
};

export default PaginatedTable;
