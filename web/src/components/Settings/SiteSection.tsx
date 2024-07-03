import React from "react";
import SettingsTitle from "./SettingsTitle.tsx";

function SiteSection() {
  return (
    <section className="border-b pb-4 mb-4">
      <SettingsTitle title="Site URL" />
      <input
        className="border p-1 text-sm my-2 outline-none rounded w-64"
        value={"https://example.com"}
        type="url"
        placeholder="Your Site URL"
        disabled={true}
      />
    </section>
  );
}

export default SiteSection;
