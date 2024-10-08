import React from "react";
import { motion } from "framer-motion";
import ActionButton from "./ActionButton";
import { Action, Column } from "./types";
import { Link } from "react-router-dom";

export interface Row {
  [key: string]: any;
}

interface CustomTableProps {
  columns: Column<any>[];
  rows: Row[];
  actions?: Action<any>[];
  showActions?: boolean;
  noRecordsComponent?: React.ReactNode;
}

const CustomTable: React.FC<CustomTableProps> = ({
  columns,
  rows,
  actions = [],
  showActions = true,
  noRecordsComponent,
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
                key={col.key as string}
                className={`text-left text-xs font-medium text-gray-500 uppercase px-4 py-2 ${
                  col.isMain ? "w-full" : ""
                } min-w-[200px]`}>
                {col.header}
              </th>
            ))}
            {showActions && actions?.length > 0 && (
              <th className="px-4 py-2 min-w-[50px]"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <motion.tr
              initial={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5 }}>
              <td
                colSpan={columns.length + (showActions ? 1 : 0)}
                className="text-center py-8">
                {noRecordsComponent ?? (
                  <div className="justify-center w-full items-center flex flex-col py-8">
                    <img
                      src={"/logo/logo.png"}
                      alt="logo"
                      className="h-20 mb-4 "
                    />
                    <div className="text-sm text-gray-500 mb-2 text-center">
                      No records found
                    </div>
                    <div>
                      <Link to="https://docs.drdroid.io" target="_blank">
                        <div className="text-sm rounded-lg py-2 px-2 cursor-pointer border-violet-600 text-violet-500 hover:text-violet-800 transition-all flex">
                          Check Documentation
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </td>
            </motion.tr>
          ) : (
            rows.map((row, rowIndex) => (
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
                    key={col.key as string}
                    className="text-sm px-4 py-2 min-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                    {row[col.key as string]}
                  </td>
                ))}
                {showActions && actions?.length > 0 && (
                  <td className="text-sm px-4 py-2 text-right min-w-[50px]">
                    <ActionButton actions={actions} row={row} />
                  </td>
                )}
              </motion.tr>
            ))
          )}
        </tbody>
      </motion.table>
    </div>
  );
};

export default CustomTable;
