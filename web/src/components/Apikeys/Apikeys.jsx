/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { MaskCharacter } from "../../utils/Apikeys.js";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import TableSkeleton from "../Skeleton/TableLoader.js";
import SuspenseLoader from "../Skeleton/SuspenseLoader.js";
import Heading from "../Heading.jsx";
import NoAPIKeys from "./NoAPIKeys.js";
import dayjs from "dayjs";
import {
  useGenerateAPIKeyMutation,
  useGetAPIKeyQuery,
} from "../../store/features/APIKeys/api/index.ts";
import { CircularProgress } from "@mui/material";

const columns = [
  {
    field: "key",
    headerName: "Token",
    flex: 1,
    valueGetter: (params) => {
      const masked = MaskCharacter(String(params?.value), "*", 4);
      return masked;
    },
  },
  {
    field: "created_at",
    headerName: "Created At",
    flex: 1,
    valueGetter: (params) => {
      const format = "YYYY-MM-DD HH:mm:ss";
      const date = new Date(params?.value);
      return dayjs(date).format(format);
    },
  },
  {
    field: "created_by",
    headerName: "Created by",
    flex: 1,
  },
  {
    flex: 1,
    renderCell: (params) => {
      const apiKeyVal = params.row.key;
      const handleCopyClick = (val) => async () => {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(val);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = val;
          textArea.style.position = "absolute";
          textArea.style.left = "-999999px";
          document.body.prepend(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
          } catch (error) {
            console.error(error);
          } finally {
            textArea.remove();
          }
        }
      };
      return (
        <Button variant="text" onClick={handleCopyClick(apiKeyVal)}>
          Copy Token
        </Button>
      );
    },
  },
];

const ApiTokens = () => {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const meta = {
    limit: pageSize,
    offset: pageSize * page,
  };
  const { data, isLoading, isError, refetch } = useGetAPIKeyQuery(meta);
  const [triggerGenerateAPIKey, { isLoading: generateLoading }] =
    useGenerateAPIKeyMutation();

  useEffect(() => {
    if (!isLoading) refetch({ limit: pageSize, offset: pageSize * page });
  }, [page, pageSize]);

  useEffect(() => {
    if (data?.meta) setPageSize(Number(data?.meta?.page?.limit));
  }, [data]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handleCreateApiKey = async () => {
    await triggerGenerateAPIKey();
    window.location.reload();
  };

  return (
    <>
      <Heading heading={"API keys"}></Heading>
      <main className="flex flex-col gap-4 p-2 pt-4">
        <div className="flex items-center justify-between">
          <button
            className="text-sm bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg !text-white"
            onClick={handleCreateApiKey}>
            + API Key
          </button>
          {generateLoading && <CircularProgress color="primary" size={20} />}
        </div>
        <SuspenseLoader
          loading={isLoading}
          loader={<TableSkeleton noOfLines={7} />}>
          <Paper
            className="!shadow-none"
            sx={{ width: "100%", height: "360px" }}>
            {data?.account_api_tokens && (
              <DataGrid
                sx={{
                  ".MuiDataGrid-columnSeparator": {
                    display: "none",
                  },
                }}
                disableColumnMenu
                sortable={false}
                pagination
                paginationMode="server"
                rowCount={data?.meta?.total_count}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                rowsPerPageOptions={[10, 20, 50]}
                onPageChange={handlePageChange}
                rows={data?.account_api_tokens}
                columns={columns.map((column) => ({
                  ...column,
                  sortable: false,
                }))}
                getRowId={(params) => params?.key}
                disableSelectionOnClick
              />
            )}

            {!data?.account_api_tokens && <NoAPIKeys />}
          </Paper>
        </SuspenseLoader>
      </main>
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
export default ApiTokens;
