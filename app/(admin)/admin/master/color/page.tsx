import type { Metadata } from "next";
import { MasterManager } from "@/components/admin/master/master-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Master · Color",
};

export default function AdminMasterColorPage() {
  return <MasterManager type="color" initialItems={[]} />;
}
