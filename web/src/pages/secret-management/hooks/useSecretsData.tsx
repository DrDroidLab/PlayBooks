import { renderTimestamp } from "../../../utils/common/dateUtils";
import { DeleteRounded } from "@mui/icons-material";
import useToggle from "../../../hooks/common/useToggle";
import { useState } from "react";

export const useSecretsData = (data: any[]) => {
  const { isOpen: isActionOpen, toggle } = useToggle();
  const { isOpen: isConfigOpen, toggle: toggleConfig } = useToggle();
  const [selectedSecret, setSelectedSecret] = useState({});
  const [selectedId, setSelectedId] = useState("");

  const handleDeleteSecret = (variable: any) => {
    setSelectedSecret(variable);
    toggle();
  };

  const handleUpdateVariable = (variable: any) => {
    setSelectedId(variable.id);
    toggleConfig();
  };

  const actions = [
    {
      icon: <DeleteRounded />,
      label: "Delete",
      action: (item: any) => handleDeleteSecret(item),
      tooltip: "Remove this Secret",
    },
  ];

  const rows = data?.map((item: any) => ({
    ...item,
    name: (
      <p
        onClick={() => handleUpdateVariable(item)}
        className={
          "text-violet-500 dark:text-purple-400 hover:text-violet-800 dark:hover:text-purple-300"
        }>
        {item.key}
      </p>
    ),
    createdAt: (
      <p className="whitespace-nowrap text-xs">
        {renderTimestamp(item.created_at)}
      </p>
    ),
    createdBy: <p className="whitespace-nowrap text-xs">{item.created_by}</p>,
  }));

  return {
    rows,
    actions,
    selectedSecret,
    isActionOpen,
    toggle,
    isConfigOpen,
    toggleConfig,
    selectedId,
  };
};
