import { InfoOutlined } from "@mui/icons-material";
import React, { useState } from "react";
import { HandleInputRender } from "../../common/HandleInputRender/HandleInputRender";
import { useDispatch, useSelector } from "react-redux";
import { connectorSelector } from "../../../store/features/integrations/integrationsSlice.ts";
import { useGenerateManifestMutation } from "../../../store/features/integrations/api/generateManifestApi.ts";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice.ts";
import { CircularProgress } from "@mui/material";
import "highlight.js/styles/default.css";
import CopyCodeDrawer from "../../common/CopyCode/CopyCodeDrawer.jsx";

function SlackManifestGenerator() {
  const [host, setHost] = useState("");
  const dispatch = useDispatch();
  const [triggerManifest, { isLoading }] = useGenerateManifestMutation();
  const currentConnector = useSelector(connectorSelector);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!host) {
      dispatch(showSnackbar("Please enter a host name"));
      return;
    }

    triggerManifest(host);
  };

  return (
    <main className="p-2 my-2 rounded bg-white border mr-3">
      <form
        onSubmit={handleSubmit}
        className="flex my-2 items-end gap-2 flex-wrap">
        <HandleInputRender
          option={{
            type: "string",
            label: "Host Name",
            value: host,
            handleChange: setHost,
          }}
        />

        <div className="flex items-center gap-2">
          <button className="p-1 text-violet-500 hover:text-white hover:bg-violet-500 border border-violet-500 text-xs rounded cursor-pointer transition-all">
            Get Manifest
          </button>

          {isLoading && <CircularProgress size={20} />}
        </div>
      </form>

      {currentConnector.manifest && (
        <CopyCodeDrawer
          title={"Slack manifest"}
          subtitle={"Copy the manifest and use it to create an application"}
          help={
            <>
              Read more in our{" "}
              <a
                className="underline text-violet-500"
                href="https://docs.drdroid.io/docs/setting-up-slack-alert-enrichment-on-self-hosted-playbooks#setup-your-slack-integration"
                target="_blank"
                rel="noreferrer">
                Docs
              </a>
            </>
          }
          content={currentConnector.manifest}
          language={"yaml"}
        />
      )}

      <hr />

      <div className="bg-gray-100 rounded my-2 text-sm p-2 text-violet-500 flex items-center gap-2 font-semibold">
        <InfoOutlined /> After the slack app is created, share the following
      </div>
    </main>
  );
}

export default SlackManifestGenerator;
