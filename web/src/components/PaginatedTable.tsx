/* eslint-disable react-hooks/exhaustive-deps */
import { Paper, TableContainer, TablePagination } from "@mui/material";
import { useState, useCallback, useEffect } from "react";
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
  orderData?: any;
  showDelete?: boolean;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
  renderTable: RenderTableComponent,
  data,
  total,
  tableContainerStyles = {},
  params = {},
  onSortChange,
  orderData,
  showDelete = false,
}) => {
  const { page, limit, handleChangePage, handleChangeRowsPerPage } =
    usePagination();

  const [rows, setRows] = useState(data);
  const [totalRows, setTotalRows] = useState(total);
  const [isFetchingData, setIsFetchingData] = useState(false);

  useEffect(() => {
    setRows(data);
    setTotalRows(total);
  }, [data, total]);

  const handleRefreshTable = () => {
    setIsFetchingData(true);
    // Implement data fetching logic here if needed
    // Simulate a data fetch
    setTimeout(() => {
      setIsFetchingData(false);
    }, 1000);
  };

  const sliceRows = useCallback(
    (rowList) => {
      if (limit) {
        return rowList?.slice(page * limit, page * limit + limit);
      }
      return rowList;
    },
    [page, limit, rows],
  );

  return (
    <>
      <TableContainer
        component={Paper}
        className="!shadow-none !border"
        sx={tableContainerStyles}>
        <RenderTableComponent
          data={sliceRows(rows)}
          loading={isFetchingData}
          refreshTable={handleRefreshTable}
          onSortChange={onSortChange}
          params={params}
          orderData={orderData}
          showDelete={showDelete}
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
