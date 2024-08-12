import useSidebar from "../../hooks/common/sidebar/useSidebar";
import { useFetchVersionInfoQuery } from "../../store/features/management/api";

function VersionInfo() {
  const { data } = useFetchVersionInfoQuery();
  const { isOpen } = useSidebar();

  if (!data) return;

  return (
    <div
      className={`mb-2 text-xs text-gray-600 flex ${
        isOpen ? "flex-row" : "flex-col"
      } gap-2 px-1 mt-1 justify-center items-center max-w-full text-ellipsis`}>
      {data.current_version && (
        <p className="line-clamp-1">{data?.current_version}</p>
      )}
      {data.should_upgrade && (
        <>
          <p className="bg-violet-50 p-1 rounded overflow-hidden max-w-full">
            <a
              href="https://github.com/DrDroidLab/PlayBooks/releases"
              target="_blank"
              rel="noreferrer"
              className="line-clamp-3">
              {data.upgrade_message}
            </a>
          </p>
        </>
      )}
    </div>
  );
}

export default VersionInfo;
