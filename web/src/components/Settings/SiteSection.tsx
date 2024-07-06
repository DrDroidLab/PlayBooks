import React, { useState, useEffect } from "react";
import SettingsTitle from "./SettingsTitle.tsx";
import CustomButton from "../common/CustomButton/index.tsx";
import { useUpdateSiteUrlMutation } from "../../store/features/integrations/api/index.ts";
import { CircularProgress } from "@mui/material";
import { useGetSiteUrlQuery } from "../../store/features/integrations/api/getSiteUrlApi.ts";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../store/features/snackbar/snackbarSlice.ts";

function SiteSection() {
  const { data, isFetching, error: siteUrlError } = useGetSiteUrlQuery();
  const [value, setValue] = useState(data?.url);
  const [error, setError] = useState("");
  const [triggerSaveSite, { isLoading, error: saveUrlError }] =
    useUpdateSiteUrlMutation();
  const dispatch = useDispatch();

  const validate = () => {
    let errorString = "";
    if (!value || !value.trim()) {
      errorString = "Site URL is required";
    }

    if (errorString) {
      setError(errorString);
      return false;
    }

    return true;
  };

  const removeError = () => {
    if (!validate()) return;
    setError("");
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    try {
      await triggerSaveSite(value);
      dispatch(
        showSnackbar({ message: "Site URL has been updated", type: "success" }),
      );
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (value) {
      removeError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (data?.url) {
      setValue(data.url);
    }
  }, [data]);

  useEffect(() => {
    if (siteUrlError || saveUrlError) {
      setError(saveUrlError ?? siteUrlError);
    }
  }, [siteUrlError, saveUrlError]);

  return (
    <section className="border-b pb-4 mb-4">
      <SettingsTitle title="Site URL" />
      <div className="mt-2 flex flex-col items-baseline gap-2">
        <div className="flex flex-col">
          <input
            className={`${
              error ? "border-red-500" : ""
            } border p-1 text-sm outline-none rounded w-[500px]`}
            value={value}
            type="url"
            placeholder="Your Site URL"
            onChange={(e) => setValue(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs">{error.toString()}</p>}
        </div>
        <div className="flex items-center gap-2">
          <CustomButton onClick={handleUpdate}>Update</CustomButton>
          {(isLoading || isFetching) && <CircularProgress size={20} />}
        </div>
      </div>
    </section>
  );
}

export default SiteSection;
