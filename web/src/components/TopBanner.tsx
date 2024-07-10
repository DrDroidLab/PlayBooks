import React from "react";

function TopBanner() {
  return (
    <div className="w-full bg-violet-500 text-white text-center p-1 text-sm">
      We are open source on{" "}
      <a
        href="https://github.com/DrDroidLab/PlayBooks"
        target="_blank"
        content=""
        rel="noreferrer"
        className="hover:underline">
        Github
      </a>
      !
    </div>
  );
}

export default TopBanner;
