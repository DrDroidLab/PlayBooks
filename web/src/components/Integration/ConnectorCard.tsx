import React, { useState } from "react";
import { CardData } from "../../store/features/integrations/types";
import { Link } from "react-router-dom";
import { Delete } from "@mui/icons-material";
import ConnectorDeleteOverlay from "./connectors/ConnectorDeleteOverlay";

type ConnectorCardPropTypes = {
  connector: CardData;
};

function ConnectorCard({ connector }: ConnectorCardPropTypes) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="bg-gray-100 py-4 px-2 rounded flex justify-between items-center">
      <div className="flex items-center gap-3">
        <img
          src={connector.imgUrl}
          alt={`${connector.enum} Logo`}
          width={25}
          height={25}
        />
        <div className="flex flex-col">
          <h3 className="text-sm font-medium">{connector.title}</h3>
          <p className="font-semibold text-xs text-gray-400">
            {connector.enum}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setIsDeleting(true)}
          className="flex gap-1 items-center text-sm bg-white hover:bg-violet-500 text-violet-500 hover:text-white rounded p-1 border border-violet-500 shrink-0 font-medium transition-all">
          <Delete />
        </button>

        <Link
          to={`/data-sources/${connector.enum.toLowerCase()}/${connector.id}`}
          className="flex gap-1 items-center text-sm bg-white hover:bg-violet-500 text-violet-500 hover:text-white rounded p-1 border border-violet-500 shrink-0 font-medium transition-all">
          View
        </Link>
      </div>

      <ConnectorDeleteOverlay
        isOpen={isDeleting}
        toggleOverlay={() => setIsDeleting(!isDeleting)}
        successCb={() => {
          window.location.href = "/data-sources";
        }}
        connector={connector}
      />
    </div>
  );
}

export default ConnectorCard;
