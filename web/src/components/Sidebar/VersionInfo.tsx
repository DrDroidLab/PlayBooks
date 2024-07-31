import { useFetchVersionInfoQuery } from "../../store/features/management/api";

function VersionInfo() {
  const { data } = useFetchVersionInfoQuery();

  return (
    <div className="mb-2 italic text-xs text-gray-600 flex flex-row gap-2 mt-1">
      <p>{data?.current_version ? data?.current_version : ""}</p>
      {data?.should_upgrade ? (
        <>
          <p className="bg-[#9553fe59] px-1 rounded-md">
            <a
              style={{ padding: "0px" }}
              href="https://github.com/DrDroidLab/PlayBooks/releases"
              target="_blank"
              rel="noreferrer">
              {data?.upgrade_message}
            </a>
          </p>
        </>
      ) : null}
    </div>
  );
}

export default VersionInfo;
