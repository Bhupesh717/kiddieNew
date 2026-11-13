import { AVAILABLE_PRODUCT_IMAGES, categories } from "@/src/lib/store/catalog";

export type MasterType = "category" | "fabric" | "tag";
export type MasterStatus = "active" | "inactive";

export type MasterItem = {
  id: string;
  type: MasterType;
  name: string;
  slug: string;
  description: string;
  image?: string;
  status: MasterStatus;
  updatedAt: string;
};

export type MasterItemInput = {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  status?: MasterStatus;
};

export const MASTER_TYPES: readonly MasterType[] = [
  "category",
  "fabric",
  "tag",
] as const;

export function isMasterType(value: string): value is MasterType {
  return value === "category" || value === "fabric" || value === "tag";
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
  }
> = {
  category: {
    label: "Category",
    plural: "Categories",
    description:
      "Manage storefront & catalog product categories, slugs, cover visuals, and active visibility.",
    placeholderName: "e.g., Bridal Lehenga",
    placeholderDesc: "Short note about this garment category...",
    supportsImage: true,
  },
  fabric: {
    label: "Fabric",
    plural: "Fabrics",
    description:
      "Maintain fabric weaves and materials used across Majisavesh poshaks, suits, and sarees.",
    placeholderName: "e.g., Pure Georgette",
    placeholderDesc: "Weave texture, weight, or craft note...",
    supportsImage: false,
  },
  tag: {
    label: "Tag",
    plural: "Tags",
    description:
      "Control merchandising badges and highlight tags (such as Bestseller, New arrival, Limited).",
    placeholderName: "e.g., Festive edit",
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

const DEFAULT_TS = "2026-10-18T10:00:00.000Z";

export const defaultMasterStore: Record<MasterType, MasterItem[]> = {
  category: categories.map((cat, index) => ({
    id: `cat-${String(index + 1).padStart(3, "0")}`,
    type: "category",
    name: cat.name,
    slug: cat.slug,
    description: `Curated ${cat.name} collection rooted in Rajasthani craft.`,
    image: cat.image,
    status: "active",
    updatedAt: DEFAULT_TS,
  })),
  fabric: [
    {
      id: "fab-001",
      type: "fabric",
      name: "Silk blend with zari work",
      slug: "silk-blend-with-zari-work",
      description: "Luminous silk weave finished with traditional metallic zari.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "fab-002",
      type: "fabric",
      name: "Cotton silk",
      slug: "cotton-silk",
      description: "Breathable cotton warp blended with soft festive sheen.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "fab-003",
      type: "fabric",
      name: "Pure silk",
      slug: "pure-silk",
      description: "Fluid natural silk crafted for heirloom drapes and sarees.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "fab-004",
      type: "fabric",
      name: "Cotton blend",
      slug: "cotton-blend",
      description: "Lightweight everyday festive textile suited for kurti sets.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "fab-005",
      type: "fabric",
      name: "Banarasi silk blend",
      slug: "banarasi-silk-blend",
      description: "Rich brocade weave with intricate motifs.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "fab-006",
      type: "fabric",
      name: "Art silk",
      slug: "art-silk",
      description: "Structured luminous weave holding pleats cleanly.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "fab-007",
      type: "fabric",
      name: "Kundan finish",
      slug: "kundan-finish",
      description: "Hand-set heritage jewellery finish.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "fab-008",
      type: "fabric",
      name: "Chanderi tissue",
      slug: "chanderi-tissue",
      description: "Sheer metallic tissue reserved for seasonal capsule edits.",
      status: "inactive",
      updatedAt: DEFAULT_TS,
    },
  ],
  tag: [
    {
      id: "tag-001",
      type: "tag",
      name: "Bestseller",
      slug: "bestseller",
      description: "Most requested atelier silhouettes.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "tag-002",
      type: "tag",
      name: "New arrival",
      slug: "new-arrival",
      description: "Freshly released pieces from the Jaipur studio.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "tag-003",
      type: "tag",
      name: "Atelier pick",
      slug: "atelier-pick",
      description: "Curated directly by our lead karigar team.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "tag-004",
      type: "tag",
      name: "Limited",
      slug: "limited",
      description: "Small-batch craft editions.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "tag-005",
      type: "tag",
      name: "Hand-finished",
      slug: "hand-finished",
      description: "Finished with hand embroidery or gota patti accents.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "tag-006",
      type: "tag",
      name: "Made to wear",
      slug: "made-to-wear",
      description: "Pre-stitched silhouettes ready to drape.",
      status: "active",
      updatedAt: DEFAULT_TS,
    },
    {
      id: "tag-007",
      type: "tag",
      name: "Archive preview",
      slug: "archive-preview",
      description: "Seasonal tag reserved for upcoming festive launches.",
      status: "inactive",
      updatedAt: DEFAULT_TS,
    },
  ],
};

