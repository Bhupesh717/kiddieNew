"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FolderTree,
  Layers,
  Palette,
  Ruler,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  MASTER_META,
  type MasterType,
  defaultMasterStore,
} from "@/src/lib/store/masters";
import { masterApiService } from "@/src/lib/api/services/master-service";

const ICONS: Record<MasterType, typeof Layers> = {
  category: Layers,
  subcategory: FolderTree,
  color: Palette,
  size: Ruler,
  fabric: Sparkles,
  tag: Tag,
};

export default function AdminMasterHubPage() {
  const [summary, setSummary] = useState<
    Array<{
      type: MasterType;
      total: number;
      active: number;
      inactive: number;
    }>
  >([
    { type: "category", total: 0, active: 0, inactive: 0 },
    { type: "subcategory", total: 0, active: 0, inactive: 0 },
    { type: "color", total: 0, active: 0, inactive: 0 },
    { type: "size", total: 0, active: 0, inactive: 0 },
    { type: "tag", total: 0, active: 0, inactive: 0 },
  ]);

  useEffect(() => {
    Promise.all([
      masterApiService.list("category", "all", true),
      masterApiService.list("subcategory", "all", true),
      masterApiService.list("color", "all", true),
      masterApiService.list("size", "all", true),
      masterApiService.list("tag", "all", true),
    ])
      .then(([cats, subs, cols, sizes, tags]) => {
        const types: Array<{ type: MasterType; items: any[] }> = [
          { type: "category", items: cats },
          { type: "subcategory", items: subs },
          { type: "color", items: cols },
          { type: "size", items: sizes },
          { type: "tag", items: tags },
        ];
        const nextSummary = types.map(({ type, items }) => {
          const active = items.filter(
            (item: any) => item.status === "active",
          ).length;
          return {
            type,
            total: items.length,
            active,
            inactive: items.length - active,
          };
        });
        setSummary(nextSummary);
      })
      .catch((err) => {
        console.error("Failed to load master summary from API", err);
      });
  }, []);

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      <div className="border-b border-border pb-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          Catalog Configuration · Master folder
        </p>
        <h1 className="mt-2 font-serif text-4xl text-primary">Master</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Manage core product masters across Category, Sub Category, and Tag — add,
          edit, and control active or inactive visibility from each subfolder.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {summary.map(({ type, total, active, inactive }) => {
          const meta = MASTER_META[type];
          const Icon = ICONS[type];
          return (
            <Link
              key={type}
              href={`/admin/master/${type}`}
              className="group flex flex-col justify-between border border-border bg-white p-6 transition hover:border-accent"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center bg-accent/10 text-accent">
                    <Icon size={18} />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {total} total
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-2xl text-primary group-hover:text-accent">
                  {meta.label}
                </h2>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  {meta.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                    {active} active
                  </span>
                  <span className="bg-secondary/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {inactive} inactive
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                  Open <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
