import React from "react";
import { motion } from "framer-motion";
import ActionButton from "./ActionButton";

interface Column {
  header: string;
  key: string;
  isMain?: boolean; // Property to designate the "main" column
}

interface Row {
  [key: string]: React.ReactNode;
}

interface Action {
  icon: React.ReactNode;
  label: string;
  action: (item: any) => void;
}

interface CustomTableProps {
  columns: Column[];
  rows: Row[];
  actions?: Action[];
  showActions?: boolean;
}

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  rows,
  actions = [],
  showActions = true,
}) => {
  return (
    <div className="overflow-x-auto">
      <motion.table
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-w-full bg-white text-gray-800 rounded-lg shadow-sm border border-gray table-auto">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-xs font-medium text-gray-500 uppercase px-4 py-2 ${
                  col.isMain ? "w-full" : ""
                } min-w-[200px]`}>
                {col.header}
              </th>
            ))}
            {showActions && <th className="px-4 py-2 min-w-[50px]"></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
              className={`${
                rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-50`}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="text-sm px-4 py-2 min-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                  {row[col.key]}
                </td>
              ))}
              {showActions && (
                <td className="text-sm px-4 py-2 text-right min-w-[50px]">
                  <ActionButton actions={actions} />
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  );
};

export default CustomTable;
