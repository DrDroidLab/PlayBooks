import { ContentCopy, InfoOutlined } from "@mui/icons-material";
import Heading from "../../Heading";
import BackButton from "../../common/BackButton/BackButton";
import { HandleInputRender } from "../../common/HandleInputRender/HandleInputRender";

function ConfigureSlack() {
  return (
    <div>
      <Heading
        heading={`Configure Slack`}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />

      <BackButton />

      <main className="p-2 m-2 rounded bg-white border">
        <form className="flex items-end gap-2 flex-wrap">
          <HandleInputRender
            option={{
              type: "string",
              label: "Host Name",
            }}
          />
          <button className="p-1 text-violet-500 hover:text-white hover:bg-violet-500 border border-violet-500 text-xs rounded cursor-pointer transition-all">
            Get Manifest
          </button>
        </form>

        <div className="my-2">
          <button className="border my-2 bg-white rounded p-1 text-xs font-bold flex gap-1 items-center cursor-pointer hover:border-violet-500 hover:text-violet-500 transition-all">
            <ContentCopy fontSize="small" />
            Copy Code
          </button>
          <div className="border bg-gray-100 h-64 relative lg:max-w-xl overflow-scroll p-2 text-gray-500"></div>
          <button className="p-1 my-2 text-violet-500 hover:text-white hover:bg-violet-500 border border-violet-500 text-xs rounded cursor-pointer transition-all">
            Test Connection
          </button>
        </div>

        <hr />

        <div className="bg-gray-100 rounded my-2 text-sm p-2 text-violet-500 flex items-center gap-2 font-semibold">
          <InfoOutlined /> After the slack app is created, share the following
        </div>

        <HandleInputRender
          option={{
            type: "string",
            label: "Slack Bot OAuth Token",
          }}
        />

        <HandleInputRender
          option={{
            type: "string",
            label: "App ID",
          }}
        />

        <button className="p-2 mt-4 text-violet-500 hover:text-white hover:bg-violet-500 border border-violet-500 text-sm rounded cursor-pointer transition-all">
          Save Configuration
        </button>
      </main>
    </div>
  );
}

export default ConfigureSlack;
