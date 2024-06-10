/* eslint-disable react-hooks/exhaustive-deps */
import { Paper, TableContainer, TablePagination } from "@mui/material";
import { useCallback, useState } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const rowsPerPageOptions = [2, 5, 10, 25, 100];
const PaginatedTable = ({
  renderTable,
  data,
  total,
  pageSize,
  pageUpdateCb,
  tableContainerStyles,
  params,
  onSortChange,
  orderData,
  showDelete,
}) => {
  const RenderTableComponent = renderTable;

  const [rows, setRows] = useState(data);
  const [totalRows, setTotalRows] = useState(total);

  const [curPage, setCurPage] = useState(0);
  const [curPageSize, setCurPageSize] = useState(pageSize);

  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleChangePage = useCallback(
    (event, newPage) => {
      setCurPage(newPage);
      if (!pageUpdateCb) {
        return;
      }
      setIsFetchingData(true);
      pageUpdateCb(
        {
          limit: curPageSize,
          offset: curPageSize * newPage,
        },
        (rowData, total) => {
          setRows(rowData);
          setTotalRows(Number(total));
          setIsFetchingData(false);
        },
        (err) => {
          console.error(err);
          setIsError(true);
          setIsFetchingData(false);
        },
      );
    },
    [curPageSize, curPage],
  );

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      let newPageSize = parseInt(event.target.value, 10);
      setCurPageSize(newPageSize);
      setCurPage(0);
      if (!pageUpdateCb) {
        return;
      }
      setIsFetchingData(true);
      pageUpdateCb(
        {
          limit: newPageSize,
          offset: 0,
        },
        (rowData, total) => {
          setRows(rowData);
          setTotalRows(Number(total));
          setIsFetchingData(false);
        },
        (err) => {
          console.error(err);
          setIsError(true);
          setIsFetchingData(false);
        },
      );
    },
    [curPageSize, curPage],
  );

  const handleRefreshTable = () => {
    setIsFetchingData(true);
    pageUpdateCb(
      {
        limit: curPageSize,
        offset: curPageSize * curPage,
      },
      (rowData, total) => {
        setRows(rowData);
        setTotalRows(Number(total));
        setIsFetchingData(false);
      },
      (err) => {
        console.error(err);
        setIsError(true);
        setIsFetchingData(false);
      },
    );
  };

  const sliceRows = useCallback(
    (rowList) => {
      if (!pageUpdateCb && curPageSize) {
        return rowList?.slice(
          curPage * curPageSize,
          curPage * curPageSize + curPageSize,
        );
      }
      return rowList;
    },
    [curPage, curPageSize, rows, pageUpdateCb],
  );

  return (
    <>
      <TableContainer
        component={Paper}
        className="!shadow-none !border"
        sx={tableContainerStyles ? tableContainerStyles : {}}>
        {
          <RenderTableComponent
            data={sliceRows(rows)}
            loading={isFetchingData}
            refreshTable={handleRefreshTable}
            onSortChange={onSortChange}
            params={params}
            orderData={orderData}
            showDelete={showDelete}
          />
        }
      </TableContainer>
      {pageSize ? (
        <TablePagination
          component="div"
          rowsPerPageOptions={rowsPerPageOptions}
          count={totalRows}
          rowsPerPage={curPageSize}
          page={curPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      ) : null}

      <Snackbar
        open={isError}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity="error" sx={{ width: "100%" }}>
          Something went wrong. Please contact Administrator
        </Alert>
      </Snackbar>
    </>
  );
};

export default PaginatedTable;
