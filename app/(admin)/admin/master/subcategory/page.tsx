import type { Metadata } from "next";
import { MasterManager } from "@/components/admin/master/master-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Master · Sub Category | KiddieQuick Admin",
};

export default function AdminMasterSubcategoryPage() {
  return <MasterManager type="subcategory" initialItems={[]} />;
}
