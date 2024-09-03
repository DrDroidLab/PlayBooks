/* eslint-disable react-hooks/exhaustive-deps */
import { Paper, TableContainer, TablePagination } from "@mui/material";
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

  return (
    <>
      <TableContainer
        component={Paper}
        className="!shadow-none !border"
        sx={tableContainerStyles}>
        <CustomTable columns={columns} rows={data} actions={actions} />
      </TableContainer>
      {limit ? (
        <TablePagination
          component="div"
          rowsPerPageOptions={rowsPerPageOptions}
          count={total}
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
