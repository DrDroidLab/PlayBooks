/* eslint-disable react-hooks/exhaustive-deps */
import { Paper, TableContainer, TablePagination } from "@mui/material";
import { useState, useEffect } from "react";
import React from "react";
import usePagination from "../hooks/usePagination.ts";

const rowsPerPageOptions = [2, 5, 10, 25, 100];

interface PaginatedTableProps {
  renderTable: React.ComponentType<any>;
  data: any[];
  total: number;
  tableContainerStyles?: object;
  params?: any;
  onSortChange?: (params: any) => void;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
  renderTable: RenderTableComponent,
  data,
  total,
  tableContainerStyles = {},
  params = {},
  onSortChange,
}) => {
  const { page, limit, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const [rows, setRows] = useState(data);
  const [totalRows, setTotalRows] = useState(total);

  useEffect(() => {
    setRows(data);
    setTotalRows(total);
  }, [data, total]);

  return (
    <>
      <TableContainer
        component={Paper}
        className="!shadow-none !border"
        sx={tableContainerStyles}>
        <RenderTableComponent
          data={rows}
          onSortChange={onSortChange}
          params={params}
        />
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
