"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, RotateCcw, Search, X } from "lucide-react";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";

export type ModuleField = {
  label: string;
  placeholder: string;
  defaultValue?: string;
};

type ModulePageProps = {
  storageKey?: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: string;
  createFields?: ModuleField[];
  columns: string[];
  rows: string[][];
};

const positiveStatuses = new Set([
  "active",
  "published",
  "delivered",
  "growing",
]);
const warningStatuses = new Set(["processing", "shipped", "draft"]);
const mutedStatuses = new Set(["expired"]);

function getStatusBadgeClass(cell: string) {
  const normalized = cell.trim().toLowerCase();
  if (positiveStatuses.has(normalized)) {
    return "inline-block bg-[#e8f4ec] px-2.5 py-0.5 text-[11px] font-medium text-[#168252]";
  }
  if (warningStatuses.has(normalized)) {
    return "inline-block bg-[#f7f1e8] px-2.5 py-0.5 text-[11px] font-medium text-[#8d3428]";
  }
  if (mutedStatuses.has(normalized)) {
    return "inline-block bg-[#f2efeb] px-2.5 py-0.5 text-[11px] font-medium text-[#77675d]";
  }
  return null;
}

export function ModulePage({
  storageKey,
  eyebrow,
  title,
  description,
  action,
  createFields,
  columns,
  rows: initialRows,
}: ModulePageProps) {
  const [rows, setRows] = useState<string[][]>(initialRows);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<string[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [formValues, setFormValues] = useState<string[]>([]);
  const [hasCustomChanges, setHasCustomChanges] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          setRows(parsed as string[][]);
          setHasCustomChanges(true);
        }
      }
    } catch {
      // Ignore malformed cache
    }
  }, [storageKey]);

  useEffect(() => {
    if (!creating && !selectedRow) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCreating(false);
        setSelectedRow(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [creating, selectedRow]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.join(" ").toLowerCase().includes(query));
  }, [rows, search]);

  const pagination = useTablePagination(filteredRows);

  function openCreateDialog() {
    const defaults = columns.map(
      (_, index) => createFields?.[index]?.defaultValue ?? "",
    );
    setFormValues(defaults);
    setCreating(true);
  }

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRow = columns.map((_, index) => formValues[index]?.trim() || "—");
    const updated = [nextRow, ...rows];
    setRows(updated);
    setHasCustomChanges(true);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // Ignore quota errors
      }
    }
    setCreating(false);
  }

  function resetDemoRows() {
    setRows(initialRows);
    setHasCustomChanges(false);
    if (storageKey) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage errors
      }
    }
  }

  return (
    <section className="container mx-auto px-6 py-8 lg:px-10 lg:py-12">
      <div className="flex flex-col justify-between gap-5 border-b border-[#dfd8cf] pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44436]">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#39231e]">{title}</h1>
          <p className="mt-2 max-w-xl text-sm text-[#776f68]">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasCustomChanges && (
            <button
              type="button"
              onClick={resetDemoRows}
              className="inline-flex items-center justify-center gap-2 border border-[#dfd8cf] bg-white px-3 py-3 text-xs text-[#776f68] hover:border-[#8d3428]"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
          {action && (
            <button
              type="button"
              onClick={openCreateDialog}
              className="inline-flex items-center justify-center gap-2 bg-[#8d3428] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#70281f]"
            >
              <Plus size={15} /> {action}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-hidden border border-[#dfd8cf] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#eee8e0] p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 border border-[#dfd8cf] px-3 py-2 text-sm text-[#a49a90]">
            <Search size={15} />
            <span className="sr-only">Search {title.toLowerCase()}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                pagination.setPage(1);
              }}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full bg-transparent text-sm text-[#39231e] outline-none placeholder:text-[#a49a90] sm:w-64"
            />
          </label>
          <span className="text-xs text-[#a49a90]">
            {filteredRows.length}{" "}
            {filteredRows.length === 1 ? "record" : "records"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#faf7f3] text-[10px] uppercase tracking-[0.12em] text-[#a48668]">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-5 py-4 font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((row, index) => (
                <tr
                  key={`${row[0]}-${index}`}
                  onClick={() => setSelectedRow(row)}
                  className="cursor-pointer border-t border-[#eee8e0] text-[#5f5750] transition hover:bg-[#faf7f3]"
                >
                  {row.map((cell, cellIndex) => {
                    const badgeClass =
                      cellIndex === row.length - 1
                        ? getStatusBadgeClass(cell)
                        : null;
                    return (
                      <td
                        key={cellIndex}
                        className={`px-5 py-4 ${cellIndex === 0 ? "font-medium text-[#39231e]" : ""}`}
                      >
                        {badgeClass ? (
                          <span className={badgeClass}>{cell}</span>
                        ) : (
                          cell
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filteredRows.length && (
          <p className="p-8 text-center text-sm text-[#77675d]">
            No records match &ldquo;{search}&rdquo;.
          </p>
        )}
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startEntry={pagination.startEntry}
          endEntry={pagination.endEntry}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="records"
        />
      </div>

      {selectedRow && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#201915]/50 p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRow(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-detail-title"
            className="w-full max-w-md bg-[#fffdf9] p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a44436]">
                  {title}
                </p>
                <h2
                  id="module-detail-title"
                  className="mt-1 font-serif text-2xl text-[#39231e]"
                >
                  {selectedRow[0]}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                aria-label="Close record details"
                className="p-1.5"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mt-5 divide-y divide-[#eee8e0] border-y border-[#eee8e0]">
              {columns.map((column, index) => (
                <div
                  key={column}
                  className="flex justify-between gap-4 py-3 text-sm"
                >
                  <dt className="text-[#776f68]">{column}</dt>
                  <dd className="text-right font-medium text-[#39231e]">
                    {selectedRow[index] ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="bg-[#39231e] px-5 py-2.5 text-[10px] uppercase tracking-wider text-white"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}

      {creating && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#201915]/50 p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCreating(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-create-title"
            className="w-full max-w-md bg-[#fffdf9] p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a44436]">
                  {title}
                </p>
                <h2
                  id="module-create-title"
                  className="mt-1 font-serif text-2xl text-[#39231e]"
                >
                  {action}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCreating(false)}
                aria-label="Close form"
                className="p-1.5"
              >
                <X size={18} />
              </button>
            </div>
            <form
              onSubmit={handleCreateSubmit}
              className="mt-5 flex flex-col gap-4"
            >
              {columns.map((column, index) => (
                <label key={column} className="text-xs">
                  {createFields?.[index]?.label ?? column}
                  <input
                    required
                    value={formValues[index] ?? ""}
                    onChange={(event) =>
                      setFormValues((current) =>
                        current.map((val, i) =>
                          i === index ? event.target.value : val,
                        ),
                      )
                    }
                    placeholder={createFields?.[index]?.placeholder ?? column}
                    className="mt-1.5 w-full border border-[#ded3c7] bg-white px-3 py-2.5 text-sm"
                  />
                </label>
              ))}
              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="border border-[#ded3c7] px-4 py-2.5 text-[10px] uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#8d3428] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
