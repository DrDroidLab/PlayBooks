import hljs from "highlight.js/lib/core";
import yaml from "highlight.js/lib/languages/yaml";
import curl from "highlight.js/lib/languages/bash";
import CustomDrawer from "../CustomDrawer/index.jsx";
import CopyCode from "../CopyCode/index.jsx";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";

hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("curl", curl);

const id = DrawerTypes.COPY_CODE;

function CopyCodeDrawer({ content, language, title, subtitle, help }) {
  return (
    <CustomDrawer id={id}>
      <div className="p-2">
        <div>
          <h1 className="font-bold text-xl">{title}</h1>
          <p className="mt-2">{subtitle}</p>
        </div>
        <CopyCode content={content} language={language} />
        {help && (
          <div className="mt-4 rounded border p-2 border-violet-500 bg-violet-50">
            {help}
          </div>
        )}
      </div>
    </CustomDrawer>
  );
}

export default CopyCodeDrawer;
