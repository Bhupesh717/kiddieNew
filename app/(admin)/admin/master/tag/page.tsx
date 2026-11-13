import type { Metadata } from "next";
import { MasterManager } from "@/components/admin/master/master-manager";
import { listMasterItems } from "@/src/lib/server/master-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Master · Tag",
};

export default function AdminMasterTagPage() {
  const items = listMasterItems("tag", "all");
  return <MasterManager type="tag" initialItems={items} />;
}

