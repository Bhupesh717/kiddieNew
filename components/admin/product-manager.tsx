"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  Check,
  Eye,
  Minus,
  Palette,
  Pencil,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  formatPrice,
  type ProductVariant,
  type StoreProduct,
} from "@/src/lib/store/catalog";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { BlogRichContent } from "@/components/storefront/blog-rich-content";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { normalizeRichContentInput } from "@/src/lib/store/blog";
import { masterApiService } from "@/src/lib/api/services/master-service";
import type { MasterItem } from "@/src/lib/store/masters";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";
import { productApiService } from "@/src/lib/api/services/product-service";

const ADMIN_PRODUCTS_STORAGE_KEY = "kiddiequick_admin_products_v1";
const MAX_PRODUCT_IMAGES = 4;
const PRODUCT_DETAILS_TEMPLATE =
  "<ul><li><strong>Material &amp; Quality:</strong> 100% Breathable cotton · Pre-shrunk soft fabric</li><li><strong>Fit:</strong> Tailored regular fit engineered for all-day comfort</li><li><strong>Care:</strong> Machine wash cold with similar colors · Low tumble dry</li></ul>";

type Draft = {
  name: string;
  categorySlug: string;
  subCategorySlug: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  tag: string;
  images: string[];
  coverImage: string;
  description: string;
  longDescription: string;
  variants: ProductVariant[];
  isFeatured: boolean;
};

const emptyDraft: Draft = {
  name: "",
  categorySlug: "kids-wear",
  subCategorySlug: "",
  price: 0,
  compareAtPrice: 0,
  stock: 0,
  tag: "New arrival",
  images: [],
  coverImage: "",
  description: "",
  longDescription: "<p></p>",
  variants: [],
  isFeatured: false,
};

async function uploadProductImageFile(file: File): Promise<string> {
  return productApiService.uploadImage(file);
}

export function ProductManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"add" | "edit" | "view" | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [imageError, setImageError] = useState("");
  const [editorSessionKey, setEditorSessionKey] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState<MasterItem[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<MasterItem[]>(
    [],
  );
  const [tagOptions, setTagOptions] = useState<MasterItem[]>([]);
  const [colorOptions, setColorOptions] = useState<MasterItem[]>([]);
  const [sizeOptions, setSizeOptions] = useState<MasterItem[]>([]);
  const [sizeGroupFilter, setSizeGroupFilter] = useState<string>("all");

  // Inline "Add New Color" on the fly
  const [showColorModal, setShowColorModal] = useState(false);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#800020");
  const [colorSaving, setColorSaving] = useState(false);

  // Inline "Add New Size" on the fly
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeGroup, setNewSizeGroup] = useState("kids");
  const [sizeSaving, setSizeSaving] = useState(false);

  // Quick variant generator inputs (start empty)
  const [genSizes, setGenSizes] = useState("");
  const [genColors, setGenColors] = useState("");
  const [genPrice, setGenPrice] = useState<number | "">("");
  const [genComparePrice, setGenComparePrice] = useState<number | "">("");
  const [genStock, setGenStock] = useState<number | "">("");

  const loadLiveProducts = () => {
    setLoading(true);
    productApiService
      .adminList()
      .then((live) => {
        setProducts(Array.isArray(live) ? live : []);
      })
      .catch((err) => {
        console.error("Failed to load admin products", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLiveProducts();
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      masterApiService.list("category", "active"),
      masterApiService.list("subcategory", "active"),
      masterApiService.list("tag", "active"),
      masterApiService.list("color", "active"),
      masterApiService.list("size", "active"),
    ])
      .then(([cats, subs, tags, cols, sizes]) => {
        if (cancelled) return;
        const dedupe = (
          items: MasterItem[],
          keyFn: (item: MasterItem) => string,
        ) => {
          const seen = new Set<string>();
          return items.filter((item) => {
            const key = keyFn(item);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };
        if (cats.length)
          setCategoryOptions(dedupe(cats, (c) => c.slug || c.id));
        if (subs.length)
          setSubCategoryOptions(dedupe(subs, (s) => s.slug || s.id));
        if (tags.length) setTagOptions(dedupe(tags, (t) => t.name || t.id));
        if (cols && cols.length)
          setColorOptions(dedupe(cols, (c) => c.name || c.id));
        if (sizes && sizes.length)
          setSizeOptions(dedupe(sizes, (s) => s.name || s.id));
      })
      .catch(() => {
        // Keep seeded active options if API unavailable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSubCategories = useMemo(() => {
    if (!draft.categorySlug) return subCategoryOptions;
    const matches = subCategoryOptions.filter(
      (s) => !s.categorySlug || s.categorySlug === draft.categorySlug,
    );
    return matches.length > 0 ? matches : subCategoryOptions;
  }, [subCategoryOptions, draft.categorySlug]);

  useEffect(() => {
    if (!dialog) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog]);

  const activeProduct = products.find((product) => product.id === activeId);
  const visibleProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.category} ${product.id}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const pagination = useTablePagination(visibleProducts);

  function startAdd() {
    setFormError("");
    setImageError("");
    const defaultCat = categoryOptions[0]?.slug ?? "kids-wear";
    setDraft({
      ...emptyDraft,
      categorySlug: defaultCat,
      subCategorySlug: "",
      tag: tagOptions[0]?.name ?? "New arrival",
      price: 0,
      stock: 0,
      isFeatured: false,
      variants: [],
    });
    setGenSizes("");
    setGenColors("");
    setGenPrice("");
    setGenComparePrice("");
    setGenStock("");
    setActiveId(null);
    setEditorSessionKey((k) => k + 1);
    setDialog("add");
  }

  function startEdit(product: StoreProduct) {
    setFormError("");
    setImageError("");
    setActiveId(product.id);
    const existingGallery = Array.from(
      new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
    ).slice(0, MAX_PRODUCT_IMAGES);

    const variants = (
      product.variants && product.variants.length > 0
        ? product.variants
        : [
            {
              size: "Standard",
              color: "Default",
              price: product.price,
              compareAtPrice: product.compareAtPrice ?? 0,
              stock: product.stock,
            },
          ]
    ).map((v) => {
      if (!v.colorCode && v.color) {
        const matched = colorOptions.find(
          (c) => c.name.toLowerCase() === v.color.toLowerCase(),
        );
        return {
          ...v,
          colorCode: matched?.colorCode || matched?.color_code,
        };
      }
      return v;
    });

    setDraft({
      name: product.name,
      categorySlug: product.categorySlug,
      subCategorySlug: product.subCategorySlug ?? "",
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? 0,
      stock: product.stock,
      tag: product.tag,
      images: existingGallery,
      coverImage: product.image,
      description: product.description,
      longDescription:
        product.longDescription || `<p>${product.description}</p>`,
      variants,
      isFeatured: Boolean(product.isFeatured ?? product.is_featured),
    });
    setGenSizes("");
    setGenColors("");
    setGenPrice("");
    setGenComparePrice("");
    setGenStock("");
    setEditorSessionKey((k) => k + 1);
    setDialog("edit");
  }

  function toggleGenColor(colorName: string) {
    const current = genColors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const exists = current.some(
      (c) => c.toLowerCase() === colorName.toLowerCase(),
    );
    const updated = exists
      ? current.filter((c) => c.toLowerCase() !== colorName.toLowerCase())
      : [...current, colorName];
    setGenColors(updated.join(", "));
  }

  function toggleGenSize(sizeName: string) {
    const current = genSizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const exists = current.some(
      (s) => s.toLowerCase() === sizeName.toLowerCase(),
    );
    const updated = exists
      ? current.filter((s) => s.toLowerCase() !== sizeName.toLowerCase())
      : [...current, sizeName];
    setGenSizes(updated.join(", "));
  }

  async function handleQuickAddColor() {
    const name = newColorName.trim();
    if (!name) return;

    // If color already exists in Master, select it directly
    const existing = colorOptions.find(
      (c) => c.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      toggleGenColor(existing.name);
      setNewColorName("");
      setShowColorModal(false);
      return;
    }

    setColorSaving(true);
    try {
      const created = await masterApiService.create("color", {
        name,
        colorCode: newColorHex,
      });
      setColorOptions((prev) => [
        created,
        ...prev.filter((c) => c.name.toLowerCase() !== name.toLowerCase()),
      ]);
      toggleGenColor(created.name);
      setNewColorName("");
      setShowColorModal(false);
    } catch {
      toggleGenColor(name);
      setShowColorModal(false);
    } finally {
      setColorSaving(false);
    }
  }

  async function handleQuickAddSize() {
    const name = newSizeName.trim();
    if (!name) return;

    // If size already exists in Master, select it directly
    const existing = sizeOptions.find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      toggleGenSize(existing.name);
      setNewSizeName("");
      setShowSizeModal(false);
      return;
    }

    setSizeSaving(true);
    try {
      const created = await masterApiService.create("size", {
        name,
        categorySlug: newSizeGroup,
      });
      setSizeOptions((prev) => [
        created,
        ...prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase()),
      ]);
      toggleGenSize(created.name);
      setNewSizeName("");
      setShowSizeModal(false);
    } catch {
      toggleGenSize(name);
      setShowSizeModal(false);
    } finally {
      setSizeSaving(false);
    }
  }

  function generateVariants() {
    const sizes = genSizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = genColors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (!sizes.length || !colors.length) return;

    const defaultPrice = Number(genPrice) || 0;
    const defaultCompare = Number(genComparePrice) || undefined;
    const defaultStock = Number(genStock) || 0;

    const generated: ProductVariant[] = [];
    for (const c of colors) {
      const matched = colorOptions.find(
        (co) => co.name.toLowerCase() === c.toLowerCase(),
      );
      const colorCode = matched?.colorCode || matched?.color_code;
      for (const s of sizes) {
        generated.push({
          color: c,
          colorCode,
          size: s,
          price: defaultPrice,
          compareAtPrice: defaultCompare,
          stock: defaultStock,
        });
      }
    }

    setDraft((prev) => {
      const nextVariants = [...prev.variants, ...generated];
      const prices = nextVariants
        .map((v) => Number(v.price) || 0)
        .filter((p) => p > 0);
      const minP = prices.length ? Math.min(...prices) : prev.price;
      const totalS = nextVariants.reduce(
        (sum, v) => sum + (Number(v.stock) || 0),
        0,
      );
      return {
        ...prev,
        variants: nextVariants,
        price: minP,
        stock: totalS,
      };
    });
  }

  function addVariantRow() {
    const defaultColor = colorOptions[0]?.name || "Black";
    const defaultColorCode =
      colorOptions[0]?.colorCode || colorOptions[0]?.color_code;
    const defaultSize = sizeOptions[0]?.name || "M";

    setDraft((prev) => {
      const nextVariants = [
        ...prev.variants,
        {
          size: defaultSize,
          color: defaultColor,
          colorCode: defaultColorCode,
          price: prev.price || 499,
          compareAtPrice: prev.compareAtPrice || 0,
          stock: 10,
        },
      ];
      const prices = nextVariants
        .map((v) => Number(v.price) || 0)
        .filter((p) => p > 0);
      const minP = prices.length ? Math.min(...prices) : prev.price;
      const totalS = nextVariants.reduce(
        (sum, v) => sum + (Number(v.stock) || 0),
        0,
      );
      return {
        ...prev,
        variants: nextVariants,
        price: minP,
        stock: totalS,
      };
    });
  }

  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    setDraft((prev) => {
      const next = [...prev.variants];
      next[index] = { ...next[index], ...patch };
      const prices = next.map((v) => Number(v.price) || 0).filter((p) => p > 0);
      const minP = prices.length ? Math.min(...prices) : prev.price;
      const totalS = next.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return {
        ...prev,
        variants: next,
        price: minP,
        stock: totalS,
      };
    });
  }

  function removeVariant(index: number) {
    setDraft((prev) => {
      const next = prev.variants.filter((_, i) => i !== index);
      const prices = next.map((v) => Number(v.price) || 0).filter((p) => p > 0);
      const minP = prices.length ? Math.min(...prices) : 0;
      const totalS = next.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return {
        ...prev,
        variants: next,
        price: minP,
        stock: totalS,
      };
    });
  }

  function insertMeterTemplate() {
    setDraft((prev) => {
      const stripped = prev.longDescription.replace(/<[^>]*>/g, "").trim();
      const nextHtml = stripped
        ? `${prev.longDescription}${PRODUCT_DETAILS_TEMPLATE}`
        : PRODUCT_DETAILS_TEMPLATE;
      return {
        ...prev,
        longDescription: nextHtml,
      };
    });
    setEditorSessionKey((k) => k + 1);
  }

  async function handleProductImageUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const remainingSlots = MAX_PRODUCT_IMAGES - draft.images.length;
    if (remainingSlots <= 0) {
      setImageError(
        `Maximum ${MAX_PRODUCT_IMAGES} images allowed per product.`,
      );
      return;
    }

    const selected = files.slice(0, remainingSlots);
    const skippedCount = files.length - selected.length;
    setImageError("");

    // 1. Validate file format and size (Max 5 MB)
    const validMimes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/avif",
    ];
    for (const file of selected) {
      if (
        !validMimes.includes(file.type.toLowerCase()) &&
        !/\.(png|jpe?g|webp|avif)$/i.test(file.name)
      ) {
        setImageError(
          `Invalid file format for "${file.name}". Only PNG, JPG, WEBP, and AVIF images are supported.`,
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        setImageError(
          `"${file.name}" is ${sizeMb} MB. Maximum allowed image size is 5 MB.`,
        );
        return;
      }
    }

    // 2. Validate Aspect Ratio (Product requires 3:4 or 4:5 Portrait)
    for (const file of selected) {
      try {
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            const img = new window.Image();
            const objectUrl = URL.createObjectURL(file);
            img.onload = () => {
              URL.revokeObjectURL(objectUrl);
              resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => {
              URL.revokeObjectURL(objectUrl);
              reject(new Error("Could not decode image"));
            };
            img.src = objectUrl;
          },
        );

        if (dimensions.height > 0) {
          const ratio = dimensions.width / dimensions.height;
          // Valid portrait range: 0.65 to 0.90
          if (ratio > 0.90 || ratio < 0.65) {
            const orientation =
              ratio > 1.35
                ? "16:9 Landscape"
                : ratio > 1.0
                ? "Landscape"
                : "Square/Narrow";
            setImageError(
              `Invalid aspect ratio for "${file.name}"! Product image must be in portrait ratio (recommended: 3:4 or 4:5, e.g. 900×1200px or 800×1000px). Selected image is ${dimensions.width}×${dimensions.height} (${orientation}, ratio ${ratio.toFixed(2)}:1). Please upload a vertical portrait photo.`,
            );
            return;
          }
        }
      } catch {
        // Let backend validate if client decode fails
      }
    }

    setUploadingImages(true);

    try {
      const uploadedUrls = await Promise.all(
        selected.map((file) => uploadProductImageFile(file)),
      );
      setDraft((prev) => {
        const nextImages = Array.from(
          new Set([...prev.images, ...uploadedUrls]),
        ).slice(0, MAX_PRODUCT_IMAGES);
        const nextCover =
          prev.coverImage && nextImages.includes(prev.coverImage)
            ? prev.coverImage
            : (nextImages[0] ?? "");
        return {
          ...prev,
          images: nextImages,
          coverImage: nextCover,
        };
      });
      if (skippedCount > 0) {
        setImageError(
          `Only ${MAX_PRODUCT_IMAGES} images are allowed; ${skippedCount} extra file(s) skipped.`,
        );
      }
    } catch (error) {
      setImageError(
        error instanceof Error ? error.message : "Image upload failed",
      );
    } finally {
      setUploadingImages(false);
    }
  }

  function removeDraftImage(targetUrl: string) {
    setImageError("");
    setDraft((prev) => {
      const nextImages = prev.images.filter((url) => url !== targetUrl);
      const nextCover =
        prev.coverImage === targetUrl ? (nextImages[0] ?? "") : prev.coverImage;
      return {
        ...prev,
        images: nextImages,
        coverImage: nextCover,
      };
    });
  }

  function setDraftCover(targetUrl: string) {
    setDraft((prev) => ({
      ...prev,
      coverImage: targetUrl,
    }));
  }

  async function adjustStock(productId: string, delta: number) {
    const current = products.find((p) => p.id === productId);
    if (!current) return;
    const nextStock = Math.max(0, current.stock + delta);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: nextStock } : p)),
    );
    try {
      await productApiService.update(productId, { stock: nextStock });
    } catch (err) {
      console.error("Failed to update stock:", err);
      loadLiveProducts();
    }
  }

  async function toggleFeatured(productId: string, nextFeatured: boolean) {
    const previous = products;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, isFeatured: nextFeatured, is_featured: nextFeatured }
          : p,
      ),
    );
    try {
      await productApiService.update(productId, { isFeatured: nextFeatured });
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
      setProducts(previous);
      alert(
        err instanceof Error ? err.message : "Failed to update featured status",
      );
    }
  }

  async function deleteProduct(productId: string) {
    const previous = products;
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    if (activeId === productId) setDialog(null);
    try {
      await productApiService.remove(productId);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setProducts(previous);
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  function resetCatalog() {
    loadLiveProducts();
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (draft.images.length === 0) {
      setImageError("Please upload at least 1 product image (up to 4).");
      return;
    }

    if (draft.variants.length === 0) {
      setFormError(
        "Please configure at least 1 variant (Size & Color) for this product.",
      );
      return;
    }

    const minPrice = Math.min(
      ...draft.variants.map((v) => Number(v.price) || 0),
    );
    const totalStock = draft.variants.reduce(
      (sum, v) => sum + (Number(v.stock) || 0),
      0,
    );

    const coverImage = draft.images.includes(draft.coverImage)
      ? draft.coverImage
      : draft.images[0];
    const galleryImages = [
      coverImage,
      ...draft.images.filter((url) => url !== coverImage),
    ].slice(0, MAX_PRODUCT_IMAGES);

    const compareAtPrice =
      Number(draft.compareAtPrice) > minPrice
        ? Number(draft.compareAtPrice)
        : undefined;

    const normalizedLong = normalizeRichContentInput(
      draft.longDescription || draft.description,
    );

    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        categorySlug: draft.categorySlug,
        subCategorySlug: draft.subCategorySlug || undefined,
        price: minPrice,
        compareAtPrice,
        stock: totalStock,
        tag: draft.tag.trim() || "New arrival",
        image: coverImage,
        images: galleryImages,
        description: draft.description.trim(),
        longDescription: normalizedLong,
        variants: draft.variants,
        isFeatured: draft.isFeatured,
      };

      if (dialog === "edit" && activeId) {
        await productApiService.update(activeId, payload);
      } else {
        await productApiService.create(payload);
      }
      loadLiveProducts();
      setDialog(null);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save product on server",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            Catalog · Product & stock management
          </p>
          <h1 className="mt-2 font-serif text-4xl text-primary">Products</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Create, view and edit products. Manage available stock right here
            alongside each product.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadLiveProducts}
            className="inline-flex items-center justify-center gap-2 border border-border bg-white px-3 py-3 text-xs text-muted-foreground hover:border-accent"
          >
            <RotateCcw size={14} /> Refresh
          </button>
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center justify-center gap-2 bg-accent px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-accent/90"
          >
            <Plus size={15} /> Add product
          </button>
        </div>
      </div>

      <div className="mt-7 overflow-hidden border border-border bg-white">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 border border-border px-3 py-2 text-sm text-muted-foreground">
            <Search size={15} />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                pagination.setPage(1);
              }}
              placeholder="Search products or SKU..."
              className="w-full bg-transparent text-sm text-primary outline-none sm:w-56"
            />
          </label>
          <span className="text-xs text-muted-foreground">
            {visibleProducts.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-background text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                {[
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Featured",
                  "Actions",
                ].map((label) => (
                  <th key={label} className="px-4 py-4 font-semibold sm:px-5">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-border text-muted-foreground"
                >
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden bg-secondary">
                        <BlogCoverImage
                          src={product.image}
                          alt={product.name}
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-primary">
                          {product.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="text-muted-foreground">
                            SKU {product.id.toUpperCase()}
                          </span>
                          {product.subCategory && (
                            <span className="bg-accent/10 px-1.5 py-0.5 font-medium text-accent">
                              {product.subCategory}
                            </span>
                          )}
                          {product.tag && (
                            <span className="bg-secondary/50 px-1.5 py-0.5 font-medium text-muted-foreground">
                              {product.tag}
                            </span>
                          )}
                          {(product.isFeatured ?? product.is_featured) && (
                            <span className="inline-flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-700">
                              <Star
                                size={10}
                                className="fill-amber-600 text-amber-600"
                              />
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <div>
                      <p className="font-medium text-primary">
                        {product.category}
                      </p>
                      {product.subCategory && (
                        <p className="text-[11px] text-accent">
                          {product.subCategory}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    {product.variants && product.variants.length > 1 ? (
                      <div>
                        <p className="font-medium text-primary">
                          {(() => {
                            const prices = product.variants
                              .map((v) => Number(v.price) || 0)
                              .filter((p) => p > 0);
                            if (!prices.length)
                              return formatPrice(product.price);
                            const min = Math.min(...prices);
                            const max = Math.max(...prices);
                            return min !== max
                              ? `Rs. ${min.toLocaleString("en-IN")} – ${max.toLocaleString("en-IN")}`
                              : formatPrice(min);
                          })()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {product.variants.length} variants
                        </p>
                      </div>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustStock(product.id, -1)}
                        disabled={product.stock <= 0}
                        aria-label={`Decrease stock for ${product.name}`}
                        className="border border-border p-1 disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        className={`min-w-20 text-center text-xs font-medium ${
                          product.stock < 5 ? "text-accent" : "text-success"
                        }`}
                      >
                        {product.stock} in stock
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustStock(product.id, 1)}
                        aria-label={`Increase stock for ${product.name}`}
                        className="border border-border p-1"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <button
                      type="button"
                      onClick={() =>
                        toggleFeatured(
                          product.id,
                          !Boolean(product.isFeatured ?? product.is_featured),
                        )
                      }
                      aria-label={
                        (product.isFeatured ?? product.is_featured)
                          ? "Remove from featured"
                          : "Mark as featured"
                      }
                      title={
                        (product.isFeatured ?? product.is_featured)
                          ? "Featured on homepage (click to remove)"
                          : "Click to feature on homepage"
                      }
                      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition ${
                        (product.isFeatured ?? product.is_featured)
                          ? "border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100"
                          : "border-border bg-white text-muted-foreground hover:border-accent hover:text-primary"
                      }`}
                    >
                      <Star
                        size={12}
                        className={
                          (product.isFeatured ?? product.is_featured)
                            ? "fill-amber-600 text-amber-600"
                            : "text-muted-foreground"
                        }
                      />
                      <span>
                        {(product.isFeatured ?? product.is_featured)
                          ? "Featured"
                          : "Standard"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(product.id);
                          setPreviewImage(null);
                          setDialog("view");
                        }}
                        aria-label={`View ${product.name}`}
                        className="border border-border p-2 hover:border-accent"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        aria-label={`Edit ${product.name}`}
                        className="border border-border p-2 hover:border-accent"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product.id)}
                        aria-label={`Delete ${product.name}`}
                        className="border border-border p-2 text-accent hover:border-accent"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Loading catalog pieces...
          </p>
        )}
        {!loading && !visibleProducts.length && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            {search
              ? "No products match that search."
              : "No products found in catalog."}
          </p>
        )}
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          startEntry={pagination.startEntry}
          endEntry={pagination.endEntry}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
          itemLabel="products"
        />
      </div>

      {dialog && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            className={`max-h-[92vh] w-full overflow-y-auto bg-popover p-5 sm:p-7 ${
              dialog === "view" ? "sm:max-w-4xl" : "sm:max-w-2xl"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">
                  Product catalog
                </p>
                <h2
                  id="product-dialog-title"
                  className="mt-1 font-serif text-2xl"
                >
                  {dialog === "add"
                    ? "Add product"
                    : dialog === "edit"
                      ? "Edit product & stock"
                      : "Product details"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDialog(null)}
                aria-label="Close dialog"
                className="p-2 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            {dialog === "view" && activeProduct ? (
              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12">
                {/* Left Column: Product Image Gallery in Proper Portrait 3:4 */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xs border border-border bg-stone-100 shadow-xs">
                    <BlogCoverImage
                      src={previewImage || activeProduct.image}
                      alt={activeProduct.name}
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover object-center"
                    />
                  </div>
                  {activeProduct.images && activeProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {activeProduct.images.map((imgUrl, idx) => {
                        const isSelected =
                          (previewImage || activeProduct.image) === imgUrl;
                        return (
                          <button
                            key={`${imgUrl}-${idx}`}
                            type="button"
                            onClick={() => setPreviewImage(imgUrl)}
                            className={`relative aspect-[3/4] overflow-hidden rounded-xs border transition cursor-pointer ${
                              isSelected
                                ? "border-accent ring-2 ring-accent/60"
                                : "border-border hover:border-stone-400"
                            } bg-secondary`}
                          >
                            <BlogCoverImage
                              src={imgUrl}
                              alt={`${activeProduct.name} ${idx + 1}`}
                              sizes="90px"
                              className="object-cover object-center"
                            />
                            {imgUrl === activeProduct.image && (
                              <span className="absolute left-1 top-1 bg-primary/90 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white">
                                Cover
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Product Details & Pricing */}
                <div className="md:col-span-7 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Categories & Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="border border-border bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700">
                        {activeProduct.category}
                      </span>
                      {activeProduct.subCategory && (
                        <span className="border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-accent">
                          {activeProduct.subCategory}
                        </span>
                      )}
                      {(activeProduct.isFeatured ?? activeProduct.is_featured) && (
                        <span className="border border-accent/20 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent">
                          ★ Featured
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-serif text-2xl font-bold text-primary">
                      {activeProduct.name}
                    </h3>

                    {/* Price & Stock */}
                    <div className="flex flex-wrap items-baseline gap-4 border-b border-border/60 pb-3">
                      <span className="font-serif text-2xl font-bold text-accent">
                        {formatPrice(activeProduct.price)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Total Stock:{" "}
                        <strong className="text-foreground">
                          {activeProduct.stock} units
                        </strong>
                      </span>
                      {activeProduct.slug && (
                        <span className="text-xs font-mono text-muted-foreground">
                          Slug: {activeProduct.slug}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {activeProduct.description && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {activeProduct.description}
                      </p>
                    )}

                    {/* Variants & Pricing Table */}
                    {activeProduct.variants &&
                      activeProduct.variants.length > 0 && (
                        <div className="border border-border p-3.5 bg-stone-50/40">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                            Variants &amp; Inventory ({activeProduct.variants.length})
                          </p>
                          <div className="max-h-44 overflow-y-auto border border-border bg-white">
                            <table className="w-full text-left text-xs">
                              <thead className="sticky top-0 bg-background text-[10px] uppercase text-muted-foreground">
                                <tr>
                                  <th className="p-2 font-semibold">Color</th>
                                  <th className="p-2 font-semibold">Size</th>
                                  <th className="p-2 font-semibold">Price</th>
                                  <th className="p-2 font-semibold">Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {activeProduct.variants.map((v, i) => (
                                  <tr
                                    key={`active-var-${v.color}-${v.size}-${i}`}
                                    className="border-t border-border"
                                  >
                                    <td className="p-2 font-medium text-primary">
                                      <div className="flex items-center gap-1.5">
                                        {v.colorCode ? (
                                          <span
                                            className="inline-block size-3 rounded-full border border-black/20 shrink-0"
                                            style={{ backgroundColor: v.colorCode }}
                                          />
                                        ) : null}
                                        <span>{v.color}</span>
                                      </div>
                                    </td>
                                    <td className="p-2 text-muted-foreground">
                                      {v.size}
                                    </td>
                                    <td className="p-2 font-semibold text-accent">
                                      {formatPrice(v.price)}
                                    </td>
                                    <td className="p-2 font-medium text-success">
                                      {v.stock} in stock
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    {/* Long Description / Rich Text */}
                    {activeProduct.longDescription && (
                      <div className="border-t border-border/60 pt-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                          Product Specifications
                        </p>
                        <div className="max-h-44 overflow-y-auto text-xs leading-relaxed text-stone-700">
                          <BlogRichContent
                            html={normalizeRichContentInput(
                              activeProduct.longDescription,
                            )}
                            className="text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
                    <button
                      type="button"
                      onClick={() => setDialog(null)}
                      className="border border-input px-4 py-2.5 text-[10px] uppercase tracking-wider text-stone-700 hover:bg-stone-50"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(activeProduct)}
                      className="bg-primary px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-primary/90"
                    >
                      Edit product
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {formError && (
                  <div
                    role="alert"
                    className="mt-4 border border-accent/30 bg-accent/10 p-3 text-xs leading-5 text-accent"
                  >
                    {formError}
                  </div>
                )}
                <form
                  onSubmit={saveProduct}
                  className="mt-5 flex flex-col gap-4"
                >
                  <label className="text-xs">
                    Product name
                    <input
                      required
                      value={draft.name}
                      onChange={(event) =>
                        setDraft({ ...draft, name: event.target.value })
                      }
                      className="mt-2 w-full border border-input bg-white px-3 py-3 text-sm"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="text-xs">
                      Category *
                      <select
                        value={draft.categorySlug}
                        onChange={(event) => {
                          const newCat = event.target.value;
                          const matchingSubs = subCategoryOptions.filter(
                            (s) => !s.categorySlug || s.categorySlug === newCat,
                          );
                          setDraft({
                            ...draft,
                            categorySlug: newCat,
                            subCategorySlug: matchingSubs[0]?.slug ?? "",
                          });
                        }}
                        className="mt-2 w-full border border-input bg-white px-3 py-3 text-sm"
                      >
                        {categoryOptions.map((category, idx) => (
                          <option
                            key={`cat-${category.slug || category.id}-${idx}`}
                            value={category.slug}
                          >
                            {category.name}
                          </option>
                        ))}
                        {draft.categorySlug &&
                          !categoryOptions.some(
                            (item) => item.slug === draft.categorySlug,
                          ) && (
                            <option value={draft.categorySlug}>
                              {draft.categorySlug}
                            </option>
                          )}
                      </select>
                    </label>
                    <label className="text-xs">
                      Sub Category *
                      <select
                        value={draft.subCategorySlug}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            subCategorySlug: event.target.value,
                          })
                        }
                        className="mt-2 w-full border border-input bg-white px-3 py-3 text-sm"
                      >
                        <option value="">Select Sub Category</option>
                        {filteredSubCategories.map((item, idx) => (
                          <option
                            key={`sub-${item.slug || item.id}-${idx}`}
                            value={item.slug}
                          >
                            {item.name}
                          </option>
                        ))}
                        {draft.subCategorySlug &&
                          !filteredSubCategories.some(
                            (item) => item.slug === draft.subCategorySlug,
                          ) && (
                            <option value={draft.subCategorySlug}>
                              {draft.subCategorySlug}
                            </option>
                          )}
                      </select>
                    </label>
                    <label className="text-xs">
                      Merchandising Tag
                      <select
                        value={draft.tag}
                        onChange={(event) =>
                          setDraft({ ...draft, tag: event.target.value })
                        }
                        className="mt-2 w-full border border-input bg-white px-3 py-3 text-sm"
                      >
                        {tagOptions.map((item, idx) => (
                          <option
                            key={`tag-${item.slug || item.id || item.name}-${idx}`}
                            value={item.name}
                          >
                            {item.name}
                          </option>
                        ))}
                        {draft.tag &&
                          !tagOptions.some(
                            (item) => item.name === draft.tag,
                          ) && <option value={draft.tag}>{draft.tag}</option>}
                      </select>
                    </label>
                  </div>

                  {/* Feature on Homepage Toggle */}
                  <div className="flex items-center justify-between border border-input bg-background p-3.5">
                    <div>
                      <label
                        htmlFor="is-featured-toggle"
                        className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary"
                      >
                        <Star
                          size={14}
                          className={
                            draft.isFeatured
                              ? "fill-accent text-accent"
                              : "text-muted-foreground"
                          }
                        />
                        Feature on Homepage
                      </label>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Display this product in the &quot;Featured
                        Collections&quot; section on the storefront homepage.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="is-featured-toggle"
                      role="switch"
                      aria-checked={draft.isFeatured}
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          isFeatured: !prev.isFeatured,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        draft.isFeatured ? "bg-accent" : "bg-neutral-300"
                      }`}
                    >
                      <span className="sr-only">Toggle Featured</span>
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          draft.isFeatured ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Variant Manager & Dynamic Pricing */}
                  <div className="border border-input bg-background p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-serif text-base text-primary">
                          Product Variants &amp; Variant Pricing
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Manage Size, Color, per-variant price (Rs.), and
                          inventory stock.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {draft.variants.length > 0 ? (
                          <span className="text-[11px] font-semibold text-accent">
                            Starting: Rs.{" "}
                            {Number(draft.price || 0).toLocaleString("en-IN")} ·
                            Total: {draft.stock} in stock
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            0 variants configured
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={addVariantRow}
                          className="inline-flex items-center gap-1 border border-accent bg-white px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent hover:text-white"
                        >
                          <Plus size={12} /> Add Row
                        </button>
                      </div>
                    </div>

                    {/* Quick Variant Generator Collapsible */}
                    <details
                      className="mt-3 border border-border bg-white p-3 text-xs"
                      open
                    >
                      <summary className="cursor-pointer font-medium text-primary select-none flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-accent" />⚡ Quick
                          Variant Generator (Sizes × Colors Matrix from Master)
                        </span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          Click to expand/collapse
                        </span>
                      </summary>

                      <div className="mt-3 space-y-3.5 border-t border-border pt-3">
                        {/* 1. Master Colors Picker & Chips */}
                        <div className="rounded-xs border border-border bg-background/50 p-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                              <Palette size={13} className="text-accent" />
                              Colors from Master ({colorOptions.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowColorModal((prev) => !prev)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                            >
                              <Plus size={12} />{" "}
                              {showColorModal ? "Close" : "Add New Color"}
                            </button>
                          </div>

                          {/* Inline Add New Color Form */}
                          {showColorModal && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xs border border-accent/30 bg-accent/5 p-2 text-xs">
                              <input
                                type="color"
                                value={newColorHex}
                                onChange={(e) => setNewColorHex(e.target.value)}
                                title="Pick color"
                                className="h-8 w-9 cursor-pointer border border-input bg-white p-0.5"
                              />
                              <input
                                type="text"
                                value={newColorName}
                                onChange={(e) =>
                                  setNewColorName(e.target.value)
                                }
                                placeholder="Color name (e.g. Olive Green)"
                                className="flex-1 min-w-[140px] border border-input bg-white px-2 py-1 text-xs outline-none"
                              />
                              <input
                                type="text"
                                value={newColorHex}
                                onChange={(e) => setNewColorHex(e.target.value)}
                                placeholder="#HEX"
                                className="w-20 font-mono border border-input bg-white px-2 py-1 text-xs outline-none"
                              />
                              <button
                                type="button"
                                disabled={colorSaving || !newColorName.trim()}
                                onClick={handleQuickAddColor}
                                className="bg-accent px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50"
                              >
                                {colorSaving
                                  ? "Saving..."
                                  : "Save to Master & Select"}
                              </button>
                            </div>
                          )}

                          {/* Color Chips */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {colorOptions.map((c) => {
                              const isSelected = genColors
                                .split(",")
                                .map((v) => v.trim().toLowerCase())
                                .includes(c.name.toLowerCase());
                              return (
                                <button
                                  key={`gen-col-${c.id}-${c.name}`}
                                  type="button"
                                  onClick={() => toggleGenColor(c.name)}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                    isSelected
                                      ? "border-accent bg-accent/15 text-accent shadow-xs ring-1 ring-accent"
                                      : "border-border bg-white text-muted-foreground hover:border-accent hover:text-primary"
                                  }`}
                                >
                                  <span
                                    className="size-3 shrink-0 rounded-full border border-black/20"
                                    style={{
                                      backgroundColor:
                                        c.colorCode || c.color_code || "#ccc",
                                    }}
                                  />
                                  <span>{c.name}</span>
                                  {isSelected && (
                                    <Check size={11} className="stroke-[3]" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Free-text input fallback for custom colors */}
                          <div className="mt-2">
                            <label className="text-[10px] text-muted-foreground">
                              Selected colors (editable comma-separated):
                              <input
                                type="text"
                                value={genColors}
                                onChange={(e) => setGenColors(e.target.value)}
                                placeholder="e.g. Navy Blue, Black, White"
                                className="mt-0.5 w-full border border-input bg-white px-2 py-1 text-xs outline-none"
                              />
                            </label>
                          </div>
                        </div>

                        {/* 2. Master Sizes Picker & Chips */}
                        <div className="rounded-xs border border-border bg-background/50 p-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1">
                              <Ruler size={13} className="text-accent" />
                              Sizes from Master ({sizeOptions.length})
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Group filter tabs */}
                              <div className="inline-flex rounded-xs border border-border bg-white p-0.5 text-[10px]">
                                {[
                                  { id: "all", label: "All" },
                                  { id: "kids", label: "Kids" },
                                  { id: "apparel", label: "Apparel" },
                                  { id: "bottoms", label: "Bottoms" },
                                ].map((tab) => (
                                  <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSizeGroupFilter(tab.id)}
                                    className={`px-1.5 py-0.5 font-medium transition ${
                                      sizeGroupFilter === tab.id
                                        ? "bg-accent text-white"
                                        : "text-muted-foreground hover:text-primary"
                                    }`}
                                  >
                                    {tab.label}
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSizeModal((prev) => !prev)
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                              >
                                <Plus size={12} />{" "}
                                {showSizeModal ? "Close" : "Add New Size"}
                              </button>
                            </div>
                          </div>

                          {/* Inline Add New Size Form */}
                          {showSizeModal && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xs border border-accent/30 bg-accent/5 p-2 text-xs">
                              <input
                                type="text"
                                value={newSizeName}
                                onChange={(e) => setNewSizeName(e.target.value)}
                                placeholder="Size name (e.g. 7-8Y or 38)"
                                className="flex-1 min-w-[120px] border border-input bg-white px-2 py-1 text-xs outline-none"
                              />
                              <select
                                value={newSizeGroup}
                                onChange={(e) =>
                                  setNewSizeGroup(e.target.value)
                                }
                                className="border border-input bg-white px-2 py-1 text-xs outline-none"
                              >
                                <option value="kids">Kids Wear</option>
                                <option value="apparel">
                                  Men/Women Apparel
                                </option>
                                <option value="bottoms">
                                  Bottoms & Waists
                                </option>
                                <option value="accessories">Accessories</option>
                              </select>
                              <button
                                type="button"
                                disabled={sizeSaving || !newSizeName.trim()}
                                onClick={handleQuickAddSize}
                                className="bg-accent px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-accent/90 disabled:opacity-50"
                              >
                                {sizeSaving
                                  ? "Saving..."
                                  : "Save to Master & Select"}
                              </button>
                            </div>
                          )}

                          {/* Size Chips */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {sizeOptions
                              .filter(
                                (s) =>
                                  sizeGroupFilter === "all" ||
                                  !s.categorySlug ||
                                  s.categorySlug === sizeGroupFilter,
                              )
                              .map((s) => {
                                const isSelected = genSizes
                                  .split(",")
                                  .map((v) => v.trim().toLowerCase())
                                  .includes(s.name.toLowerCase());
                                return (
                                  <button
                                    key={`gen-size-${s.id}-${s.name}`}
                                    type="button"
                                    onClick={() => toggleGenSize(s.name)}
                                    className={`inline-flex items-center gap-1 rounded-xs border px-2.5 py-1 text-[11px] font-medium transition ${
                                      isSelected
                                        ? "border-accent bg-accent/15 text-accent shadow-xs ring-1 ring-accent"
                                        : "border-border bg-white text-muted-foreground hover:border-accent hover:text-primary"
                                    }`}
                                  >
                                    <span>{s.name}</span>
                                    {isSelected && (
                                      <Check size={11} className="stroke-[3]" />
                                    )}
                                  </button>
                                );
                              })}
                          </div>

                          {/* Free-text input fallback for custom sizes */}
                          <div className="mt-2">
                            <label className="text-[10px] text-muted-foreground">
                              Selected sizes (editable comma-separated):
                              <input
                                type="text"
                                value={genSizes}
                                onChange={(e) => setGenSizes(e.target.value)}
                                placeholder="e.g. S, M, L, XL or 2-3Y, 3-4Y"
                                className="mt-0.5 w-full border border-input bg-white px-2 py-1 text-xs outline-none"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Pricing & Stock inputs */}
                        <div className="grid gap-3 sm:grid-cols-3">
                          <label className="text-[11px]">
                            Default Price (Rs.):
                            <input
                              type="number"
                              min="0"
                              value={genPrice}
                              onChange={(e) =>
                                setGenPrice(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="e.g. 499"
                              className="mt-1 w-full border border-input px-2 py-1.5 text-xs outline-none bg-white"
                            />
                          </label>
                          <label className="text-[11px]">
                            Compare At Price (MRP):
                            <input
                              type="number"
                              min="0"
                              value={genComparePrice}
                              onChange={(e) =>
                                setGenComparePrice(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="e.g. 699"
                              className="mt-1 w-full border border-input px-2 py-1.5 text-xs outline-none bg-white"
                            />
                          </label>
                          <label className="text-[11px]">
                            Default Stock per Variant:
                            <input
                              type="number"
                              min="0"
                              value={genStock}
                              onChange={(e) =>
                                setGenStock(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="e.g. 10"
                              className="mt-1 w-full border border-input px-2 py-1.5 text-xs outline-none bg-white"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={generateVariants}
                          className="bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 uppercase tracking-wider"
                        >
                          Generate Combinations
                        </button>
                      </div>
                    </details>

                    {/* Variants List Table */}
                    <div className="mt-3 max-h-56 overflow-y-auto border border-input bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-background text-[10px] uppercase text-muted-foreground">
                          <tr>
                            <th className="p-2 font-semibold">Color *</th>
                            <th className="p-2 font-semibold">Size *</th>
                            <th className="p-2 font-semibold">Price (Rs.) *</th>
                            <th className="p-2 font-semibold">Compare At</th>
                            <th className="p-2 font-semibold">Stock *</th>
                            <th className="p-2 text-center font-semibold">
                              Remove
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {draft.variants.map((v, idx) => (
                            <tr
                              key={`draft-variant-${v.color}-${v.size}-${idx}`}
                              className="border-t border-border"
                            >
                              <td className="p-2">
                                <div className="flex items-center gap-1.5">
                                  {v.colorCode ? (
                                    <span
                                      className="size-3.5 shrink-0 rounded-full border border-black/20 shadow-2xs"
                                      style={{ backgroundColor: v.colorCode }}
                                      title={v.colorCode}
                                    />
                                  ) : (
                                    (() => {
                                      const matched = colorOptions.find(
                                        (c) =>
                                          c.name.toLowerCase() ===
                                          v.color.toLowerCase(),
                                      );
                                      const hex =
                                        matched?.colorCode ||
                                        matched?.color_code;
                                      return hex ? (
                                        <span
                                          className="size-3.5 shrink-0 rounded-full border border-black/20 shadow-2xs"
                                          style={{ backgroundColor: hex }}
                                          title={hex}
                                        />
                                      ) : null;
                                    })()
                                  )}
                                  <input
                                    required
                                    type="text"
                                    list="master-color-list"
                                    value={v.color}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const matched = colorOptions.find(
                                        (c) =>
                                          c.name.toLowerCase() ===
                                          val.toLowerCase(),
                                      );
                                      updateVariant(idx, {
                                        color: val,
                                        colorCode:
                                          matched?.colorCode ||
                                          matched?.color_code ||
                                          v.colorCode,
                                      });
                                    }}
                                    placeholder="Color"
                                    className="w-24 border border-input px-2 py-1 text-xs outline-none"
                                  />
                                </div>
                              </td>
                              <td className="p-2">
                                <input
                                  required
                                  type="text"
                                  list="master-size-list"
                                  value={v.size}
                                  onChange={(e) =>
                                    updateVariant(idx, { size: e.target.value })
                                  }
                                  placeholder="Size"
                                  className="w-20 border border-input px-2 py-1 text-xs outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  required
                                  type="number"
                                  min="0"
                                  value={v.price || ""}
                                  onChange={(e) =>
                                    updateVariant(idx, {
                                      price: Number(e.target.value),
                                    })
                                  }
                                  className="w-20 border border-input px-2 py-1 text-xs outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={v.compareAtPrice || ""}
                                  onChange={(e) =>
                                    updateVariant(idx, {
                                      compareAtPrice:
                                        Number(e.target.value) || undefined,
                                    })
                                  }
                                  placeholder="MRP"
                                  className="w-20 border border-input px-2 py-1 text-xs outline-none"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  required
                                  type="number"
                                  min="0"
                                  value={v.stock}
                                  onChange={(e) =>
                                    updateVariant(idx, {
                                      stock: Number(e.target.value),
                                    })
                                  }
                                  className="w-16 border border-input px-2 py-1 text-xs outline-none"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeVariant(idx)}
                                  title="Delete variant"
                                  className="text-accent hover:opacity-75"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Datalists for instant browser suggestions from Master */}
                    <datalist id="master-color-list">
                      {colorOptions.map((c) => (
                        <option
                          key={`dl-col-${c.id}-${c.name}`}
                          value={c.name}
                        />
                      ))}
                    </datalist>
                    <datalist id="master-size-list">
                      {sizeOptions.map((s) => (
                        <option
                          key={`dl-siz-${s.id}-${s.name}`}
                          value={s.name}
                        />
                      ))}
                    </datalist>
                    {draft.variants.length === 0 && (
                      <p className="mt-2 text-center text-xs text-accent">
                        No variants configured yet. Click &quot;Add Row&quot; or
                        use &quot;Quick Variant Generator&quot;.
                      </p>
                    )}
                  </div>

                  <div className="border border-border bg-background p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-primary">
                          Product Images ({draft.images.length}/
                          {MAX_PRODUCT_IMAGES})
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Upload up to 4 images and select which one is the
                          cover image.
                        </p>
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          onChange={handleProductImageUpload}
                          className="sr-only"
                        />
                        <button
                          type="button"
                          disabled={
                            uploadingImages ||
                            draft.images.length >= MAX_PRODUCT_IMAGES
                          }
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 border border-primary bg-white px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          <Upload size={13} />
                          {uploadingImages
                            ? "Uploading..."
                            : draft.images.length >= MAX_PRODUCT_IMAGES
                              ? "Max 4 reached"
                              : "Upload images"}
                        </button>
                      </div>
                    </div>

                    {imageError && (
                      <div className="mt-3 flex items-start gap-2.5 rounded-sm border border-red-200 bg-red-50 p-3 text-xs text-red-800 animate-in fade-in">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-red-900">Image Validation Error</p>
                          <p className="mt-0.5 text-red-700 leading-relaxed">{imageError}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImageError("")}
                          className="text-red-400 hover:text-red-700"
                          aria-label="Dismiss error"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {draft.images.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {draft.images.map((imgUrl, index) => {
                          const isCover = draft.coverImage === imgUrl;
                          return (
                            <div
                              key={`${imgUrl}-${index}`}
                              className={`flex flex-col overflow-hidden border bg-white ${
                                isCover
                                  ? "border-accent ring-1 ring-accent"
                                  : "border-input"
                              }`}
                            >
                              <div className="relative aspect-[3/4] bg-secondary">
                                <BlogCoverImage
                                  src={imgUrl}
                                  alt={`Product preview ${index + 1}`}
                                  sizes="140px"
                                  className="object-cover"
                                />
                                {isCover && (
                                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 bg-accent px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                                    <Star size={9} fill="currentColor" />
                                    Cover
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeDraftImage(imgUrl)}
                                  aria-label={`Remove image ${index + 1}`}
                                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm transition hover:bg-accent hover:text-white"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => setDraftCover(imgUrl)}
                                className={`flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                                  isCover
                                    ? "bg-primary text-white"
                                    : "bg-background text-muted-foreground hover:bg-secondary hover:text-primary"
                                }`}
                              >
                                {isCover ? (
                                  <>
                                    <Check size={11} /> Cover image
                                  </>
                                ) : (
                                  "Set as cover"
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 flex w-full flex-col items-center justify-center gap-1.5 border border-dashed border-input bg-white px-4 py-7 text-center text-xs text-muted-foreground transition hover:border-accent hover:text-primary"
                      >
                        <Upload size={18} className="text-accent" />
                        <span className="font-medium text-primary">
                          Click to upload product photos (1 to 4 images)
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Recommended portrait ratio: 3:4 or 4:5 (e.g. 900×1200px) · Max 5 MB per image · PNG, JPG, WEBP or AVIF
                        </span>
                      </button>
                    )}
                  </div>

                  <label className="text-xs">
                    Short description (shown below product name) *
                    <textarea
                      required
                      rows={2}
                      value={draft.description}
                      onChange={(event) =>
                        setDraft({ ...draft, description: event.target.value })
                      }
                      placeholder="Brief 1-2 line overview displayed right below the product title..."
                      className="mt-2 w-full border border-input bg-white px-3 py-2.5 text-sm"
                    />
                  </label>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-medium text-primary">
                          Long description / Product details (Rich Text)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={insertMeterTemplate}
                        className="border border-input bg-white px-2.5 py-1.5 text-[11px] font-medium text-accent transition hover:border-accent"
                      >
                        + Insert meter list template
                      </button>
                    </div>
                    <RichTextEditor
                      value={draft.longDescription}
                      onChange={(html) =>
                        setDraft((prev) => ({ ...prev, longDescription: html }))
                      }
                      sessionKey={editorSessionKey}
                      uploadUrl="/api/admin/products/upload"
                      minHeightClass="min-h-[190px] max-h-[340px]"
                      ariaLabel="Long description rich text editor"
                      hideImageOption={true}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setDialog(null)}
                      className="border border-input px-4 py-3 text-[10px] uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingImages || saving}
                      className="bg-primary px-5 py-3 text-[10px] uppercase tracking-wider text-white disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : dialog === "add"
                          ? "Create product"
                          : "Save changes"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
