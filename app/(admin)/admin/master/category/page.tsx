import type { Metadata } from "next";
import { MasterManager } from "@/components/admin/master/master-manager";
import { listMasterItems } from "@/src/lib/server/master-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Master · Category",
};

export default function AdminMasterCategoryPage() {
  const items = listMasterItems("category", "all");
  return <MasterManager type="category" initialItems={items} />;
}

