"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Search, X } from "lucide-react";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";

export type ModuleField = {
  key?: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
};

type ModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: string;
  createFields?: ModuleField[];
  columns: string[];
  rows: string[][];
  loading?: boolean;
  onCreate?: (values: Record<string, string>) => Promise<void> | void;
};

const positiveStatuses = new Set([
  "active",
  "published",
  "delivered",
  "growing",
]);
const warningStatuses = new Set(["processing", "shipped", "draft"]);
const mutedStatuses = new Set(["expired", "disabled"]);

function getStatusBadgeClass(cell: string) {
  const normalized = cell.trim().toLowerCase();
  if (positiveStatuses.has(normalized)) {
    return "inline-block bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success";
  }
  if (warningStatuses.has(normalized)) {
    return "inline-block bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-accent";
  }
  if (mutedStatuses.has(normalized)) {
    return "inline-block bg-secondary/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground";
  }
  return null;
}

export function ModulePage({
  eyebrow,
  title,
  description,
  action,
  createFields,
  columns,
  rows: initialRows,
  loading = false,
  onCreate,
}: ModulePageProps) {
  const [rows, setRows] = useState<string[][]>(initialRows);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<string[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [formValues, setFormValues] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

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
    setFormError("");
    const defaults = columns.map(
      (_, index) => createFields?.[index]?.defaultValue ?? "",
    );
    setFormValues(defaults);
    setCreating(true);
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (onCreate) {
      setSaving(true);
      try {
        const payload: Record<string, string> = {};
        columns.forEach((col, index) => {
          const key = createFields?.[index]?.key || col.toLowerCase().replace(/\s+/g, "_");
          payload[key] = formValues[index]?.trim() || "";
        });
        await onCreate(payload);
        setCreating(false);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Failed to create entry on server");
      } finally {
        setSaving(false);
      }
    } else {
      const nextRow = columns.map((_, index) => formValues[index]?.trim() || "—");
      setRows([nextRow, ...rows]);
      setCreating(false);
    }
  }

  return (
    <section className="container mx-auto px-6 py-8 lg:px-10 lg:py-12">
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">{title}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {action && (
            <button
              type="button"
              onClick={openCreateDialog}
              className="inline-flex items-center justify-center gap-2 bg-accent px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-accent/90"
            >
              <Plus size={15} /> {action}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 overflow-hidden border border-border bg-white">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 border border-border px-3 py-2 text-sm text-muted-foreground">
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
              className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground sm:w-64"
            />
          </label>
          <span className="text-xs text-muted-foreground">
            {loading ? "Loading..." : `${filteredRows.length} ${filteredRows.length === 1 ? "record" : "records"}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
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
                  className="cursor-pointer border-t border-border text-muted-foreground transition hover:bg-background"
                >
                  {row.map((cell, cellIndex) => {
                    const badgeClass =
                      cellIndex === row.length - 1
                        ? getStatusBadgeClass(cell)
                        : null;
                    return (
                      <td
                        key={cellIndex}
                        className={`px-5 py-4 ${cellIndex === 0 ? "font-medium text-primary" : ""}`}
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
        {loading && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading records...
          </p>
        )}
        {!loading && !filteredRows.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search ? `No records match "${search}".` : "No records found."}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRow(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-detail-title"
            className="w-full max-w-md bg-popover p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  {title}
                </p>
                <h2
                  id="module-detail-title"
                  className="mt-1 font-serif text-2xl text-primary"
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
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {columns.map((column, index) => (
                <div
                  key={column}
                  className="flex justify-between gap-4 py-3 text-sm"
                >
                  <dt className="text-muted-foreground">{column}</dt>
                  <dd className="text-right font-medium text-primary">
                    {selectedRow[index] ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="bg-primary px-5 py-2.5 text-[10px] uppercase tracking-wider text-white"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCreating(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="module-create-title"
            className="w-full max-w-md bg-popover p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  {title}
                </p>
                <h2
                  id="module-create-title"
                  className="mt-1 font-serif text-2xl text-primary"
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
            {formError && (
              <div className="mt-3 border border-accent/30 bg-accent/10 p-2.5 text-xs text-accent">
                {formError}
              </div>
            )}
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
                    className="mt-1.5 w-full border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
              ))}
              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="border border-input px-4 py-2.5 text-[10px] uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-accent px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
