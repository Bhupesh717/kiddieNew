import type { Metadata } from "next";
import { MasterManager } from "@/components/admin/master/master-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Master · Tag",
};

export default function AdminMasterTagPage() {
  return <MasterManager type="tag" initialItems={[]} />;
}
