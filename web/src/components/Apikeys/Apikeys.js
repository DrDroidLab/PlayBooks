/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import API from "../../API";
import { MaskCharacter } from "../../utils/Apikeys";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import TableSkeleton from "../Skeleton/TableLoader";
import SuspenseLoader from "../Skeleton/SuspenseLoader";
import Heading from "../Heading";
import NoAPIKeys from "./NoAPIKeys";
import dayjs from "dayjs";
import { useGenerateAPIKeyMutation } from "../../store/features/APIKeys/api/index.ts";
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
  const [apiTokens, setApiTokens] = useState([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const fetchAccountApiToken = API.useGetAccountApiToken();
  const [triggerGenerateAPIKey, { isLoading: generateLoading }] =
    useGenerateAPIKeyMutation();

  useEffect(() => {
    setLoading(true);
    fetchAccountApiToken(
      {
        meta: {
          page: {
            limit: pageSize,
            offset: pageSize * page,
          },
        },
      },
      (res) => {
        setLoading(false);
        setApiTokens(res.data?.account_api_tokens);
        setTotal(Number(res.data?.meta?.total_count));
        setPageSize(Number(res.data?.meta?.page?.limit));
      },
      (err) => {
        console.error(err);
        setIsError(true);
      },
    );
  }, [page, pageSize]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
  };

  const handleCreateApiKey = () => {
    triggerGenerateAPIKey();
  };

  return (
    <>
      <Heading heading={"API keys"}></Heading>
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className="text-sm bg-violet-600 hover:bg-violet-700 px-4 py-2 ml-2 my-4 text-white rounded-lg create_playbook transition-all"
          onClick={handleCreateApiKey}>
          + API Key
        </button>
        {generateLoading && <CircularProgress color="primary" size={20} />}
      </div>
      <SuspenseLoader
        loading={!!loading}
        loader={<TableSkeleton noOfLines={7} />}>
        <Paper sx={{ width: "100%", height: "360px" }}>
          {apiTokens && (
            <DataGrid
              sx={{
                ".MuiDataGrid-columnSeparator": {
                  display: "none",
                },
              }}
              disableColumnMenu
              sortable={false}
              pagination
              // loading={loading}
              paginationMode="server"
              rowCount={total}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              rowsPerPageOptions={[10, 20, 50]}
              onPageChange={handlePageChange}
              rows={apiTokens}
              columns={columns.map((column) => ({
                ...column,
                sortable: false,
              }))}
              getRowId={(params) => params?.key}
              disableSelectionOnClick
            />
          )}

          {!apiTokens && <NoAPIKeys />}
        </Paper>
      </SuspenseLoader>
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
