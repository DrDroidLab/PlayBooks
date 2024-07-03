import React from "react";

type SettingsTitlePropTypes = {
  title: string;
};

function SettingsTitle({ title }: SettingsTitlePropTypes) {
  return (
    <p className="text-black font-medium text-md border-b pb-2 w-fit">
      {title}
    </p>
  );
}

export default SettingsTitle;
