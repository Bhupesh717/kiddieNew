import { AVAILABLE_PRODUCT_IMAGES, categories } from "@/src/lib/store/catalog";

export type MasterType = "category" | "subcategory" | "fabric" | "tag" | "color" | "size";
export type MasterStatus = "active" | "inactive";

export type MasterItem = {
  id: string;
  type: MasterType;
  categorySlug?: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  colorCode?: string;
  color_code?: string;
  status: MasterStatus;
  updatedAt: string;
};

export type MasterItemInput = {
  name: string;
  categorySlug?: string;
  slug?: string;
  description?: string;
  image?: string;
  colorCode?: string;
  color_code?: string;
  status?: MasterStatus;
};

export const MASTER_TYPES: readonly MasterType[] = [
  "category",
  "subcategory",
  "color",
  "size",
  "tag",
] as const;

export function isMasterType(value: string): value is MasterType {
  return (
    value === "category" ||
    value === "subcategory" ||
    value === "fabric" ||
    value === "tag" ||
    value === "color" ||
    value === "size"
  );
}

export const MASTER_META: Record<
  MasterType,
  {
    label: string;
    plural: string;
    description: string;
    placeholderName: string;
    placeholderDesc: string;
    supportsImage: boolean;
    supportsCategory?: boolean;
    supportsColorCode?: boolean;
  }
> = {
  category: {
    label: "Category",
    plural: "Categories",
    description:
      "Manage KiddieQuick main product categories (Kids Wear, Men, Women), cover visuals, and visibility.",
    placeholderName: "e.g., Kids Wear",
    placeholderDesc: "Short note about this apparel category...",
    supportsImage: true,
  },
  subcategory: {
    label: "Sub Category",
    plural: "Sub Categories",
    description:
      "Maintain sub-categories mapped to Kids, Men, and Women (e.g., T-Shirts, Frocks, Baba Suits, Jeans, Kurtas).",
    placeholderName: "e.g., Kids T-Shirts",
    placeholderDesc: "Short note on garment silhouette, age group, or style...",
    supportsImage: false,
    supportsCategory: true,
  },
  color: {
    label: "Color",
    plural: "Colors",
    description:
      "Manage product variant colors with exact names and visual hex codes (e.g. Navy Blue, Maroon, Burgundy, Blush Pink).",
    placeholderName: "e.g., Burgundy",
    placeholderDesc: "Deep wine shade for festive & everyday casual styling...",
    supportsImage: false,
    supportsColorCode: true,
  },
  size: {
    label: "Size",
    plural: "Sizes",
    description:
      "Maintain standardized sizes for Kidswear (e.g. 0-6M, 2-3Y), Men/Women apparel (e.g. S, M, L, XL), and bottom waists (e.g. 28, 30, 32).",
    placeholderName: "e.g., M or 2-3Y",
    placeholderDesc: "e.g., Medium chest size 38-40 or Toddler 2 to 3 years...",
    supportsImage: false,
    supportsCategory: true,
  },
  fabric: {
    label: "Fabric",
    plural: "Fabrics",
    description:
      "Maintain fabric weaves and textile specifications.",
    placeholderName: "e.g., Pure Cotton",
    placeholderDesc: "Weave texture or fabric care note...",
    supportsImage: false,
  },
  tag: {
    label: "Tag",
    plural: "Tags",
    description:
      "Control merchandising badges and highlight tags (such as Bestseller, New arrival, Kids special).",
    placeholderName: "e.g., Kids special",
    placeholderDesc: "Where or when this badge is highlighted...",
    supportsImage: false,
  },
};

export const AVAILABLE_CATEGORY_IMAGES = AVAILABLE_PRODUCT_IMAGES;

export function slugifyMasterName(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "") || `item-${Date.now()}`
  );
}

export const defaultMasterStore: Record<MasterType, MasterItem[]> = {
  category: [],
  subcategory: [],
  color: [],
  size: [],
  fabric: [],
  tag: [],
};
