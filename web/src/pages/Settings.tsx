import React from "react";
import Heading from "../components/Heading";

function Settings() {
  return (
    <main>
      <Heading
        heading={"Settings"}
        children={undefined}
        onTimeRangeChangeCb={false}
        onRefreshCb={false}
      />

      <div className="bg-white m-2 rounded-lg p-2">
        <section className="">
          <p className="text-gray-500 font-medium text-xs">Profile</p>
        </section>
      </div>
    </main>
  );
}

export default Settings;
