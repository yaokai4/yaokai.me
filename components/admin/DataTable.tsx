"use client";

import { ArrowDownUp } from "lucide-react";
import * as React from "react";
import { AdminEmptyState } from "@/components/admin/AdminStates";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  actions
}: {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => React.ReactNode;
}) {
  const [sortKey, setSortKey] = React.useState<string>("");
  const [direction, setDirection] = React.useState<"asc" | "desc">("asc");

  const sorted = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aValue = String((a as Record<string, unknown>)[sortKey] ?? "");
      const bValue = String((b as Record<string, unknown>)[sortKey] ?? "");
      return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  }, [data, direction, sortKey]);

  if (!data.length) {
    return <AdminEmptyState title="暂无记录" description="创建第一条内容后，这里会显示数据。" />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 font-medium">
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1"
                      onClick={() => {
                        const nextKey = String(column.key);
                        if (sortKey === nextKey) {
                          setDirection(direction === "asc" ? "desc" : "asc");
                        } else {
                          setSortKey(nextKey);
                          setDirection("asc");
                        }
                      }}
                    >
                      {column.label}
                      <ArrowDownUp className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {actions ? <th className="px-4 py-3 text-right font-medium">操作</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={String(column.key)} className="max-w-sm px-4 py-3 align-top text-slate-700">
                    {column.render ? column.render(item) : String((item as Record<string, unknown>)[String(column.key)] ?? "")}
                  </td>
                ))}
                {actions ? <td className="px-4 py-3 text-right align-top">{actions(item)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
