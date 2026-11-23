"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export function useTablePagination<T>(
  items: readonly T[],
  initialPageSize = 10,
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }, [items, pageSize, safePage]);

  const startEntry = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endEntry = Math.min(totalItems, safePage * pageSize);

  function setPageSize(nextSize: number) {
    setPageSizeState(nextSize);
    setPage(1);
  }

  return {
    paginatedItems,
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    startEntry,
    endEntry,
    setPage,
    setPageSize,
  };
}

function getVisiblePages(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 5) {
    return Array.from({ length: total }, (_, idx) => idx + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);

  return pages;
}

type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startEntry: number;
  endEntry: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: readonly number[];
  itemLabel?: string;
};

export function TablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  startEntry,
  endEntry,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  itemLabel = "entries",
}: TablePaginationProps) {
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-background px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2">
          <span>Show</span>
          <select
            aria-label="Entries per page"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-primary outline-none focus:border-accent"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>per page</span>
        </label>

        <span className="text-muted-foreground">
          Showing{" "}
          <strong className="font-medium text-primary">
            {totalItems === 0 ? 0 : `${startEntry}–${endEntry}`}
          </strong>{" "}
          of{" "}
          <strong className="font-medium text-primary">{totalItems}</strong>{" "}
          {itemLabel}
        </span>
      </div>

      <nav
        aria-label="Table pagination"
        className="flex items-center gap-1 self-end sm:self-auto"
      >
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-8 items-center gap-1 border border-border bg-white px-2.5 text-xs font-medium text-primary transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {visiblePages.map((entry, idx) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? "page" : undefined}
              className={`flex h-8 min-w-8 items-center justify-center border px-2 text-xs font-medium transition ${
                entry === page
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-muted-foreground hover:border-accent hover:text-primary"
              }`}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-8 items-center gap-1 border border-border bg-white px-2.5 text-xs font-medium text-primary transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </nav>
    </div>
  );
}
