import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles, Tag } from "lucide-react";
import { getMasterSummary } from "@/src/lib/server/master-store";
import { MASTER_META, type MasterType } from "@/src/lib/store/masters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Master",
};

const ICONS: Record<MasterType, typeof Layers> = {
  category: Layers,
  fabric: Sparkles,
  tag: Tag,
};

export default function AdminMasterHubPage() {
  const summary = getMasterSummary();

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      <div className="border-b border-[#dfd8cf] pb-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44436]">
          Catalog Configuration · Master folder
        </p>
        <h1 className="mt-2 font-serif text-4xl text-[#39231e]">Master</h1>
        <p className="mt-2 max-w-xl text-sm text-[#77675d]">
          Manage core product masters across Category, Fabric, and Tag — add,
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
              className="group flex flex-col justify-between border border-[#dfd8cf] bg-white p-6 transition hover:border-[#8d3428]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center bg-[#f7eee9] text-[#8d3428]">
                    <Icon size={18} />
                  </div>
                  <span className="text-[11px] font-medium text-[#77675d]">
                    {total} total
                  </span>
                </div>
                <h2 className="mt-5 font-serif text-2xl text-[#39231e] group-hover:text-[#8d3428]">
                  {meta.label}
                </h2>
                <p className="mt-2 text-xs leading-6 text-[#77675d]">
                  {meta.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#eee8e0] pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-[#e8f4ec] px-2 py-0.5 text-[11px] font-medium text-[#168252]">
                    {active} active
                  </span>
                  <span className="bg-[#f2efeb] px-2 py-0.5 text-[11px] font-medium text-[#77675d]">
                    {inactive} inactive
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d3428]">
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

