import type { Metadata } from "next";
import { MasterManager } from "@/components/admin/master/master-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Master · Size",
};

export default function AdminMasterSizePage() {
  return <MasterManager type="size" initialItems={[]} />;
}
