import type { Metadata } from "next";
import { MasterManager } from "@/components/admin/master/master-manager";
import { listMasterItems } from "@/src/lib/server/master-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Master · Fabric",
};

export default function AdminMasterFabricPage() {
  const items = listMasterItems("fabric", "all");
  return <MasterManager type="fabric" initialItems={items} />;
}

