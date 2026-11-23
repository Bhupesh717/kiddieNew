import type { Metadata } from "next";
import { MasterManager } from "@/components/admin/master/master-manager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Master · Category",
};

export default function AdminMasterCategoryPage() {
  return <MasterManager type="category" initialItems={[]} />;
}
