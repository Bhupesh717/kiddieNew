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
  Check,
  Eye,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  categories,
  formatPrice,
  products as demoProducts,
  type StoreProduct,
} from "@/src/lib/store/catalog";
import { BlogCoverImage } from "@/components/storefront/blog-cover-image";
import { BlogRichContent } from "@/components/storefront/blog-rich-content";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { normalizeRichContentInput } from "@/src/lib/store/blog";
import { masterApiService } from "@/src/lib/api/services/master-service";
import { defaultMasterStore, type MasterItem } from "@/src/lib/store/masters";
import {
  TablePagination,
  useTablePagination,
} from "@/components/admin/table-pagination";

const ADMIN_PRODUCTS_STORAGE_KEY = "majisavesh_admin_products_v1";
const MAX_PRODUCT_IMAGES = 4;
const PRODUCT_DETAILS_TEMPLATE =
  "<ul><li><strong>Kurti &amp; Kanchali:</strong> 2.25 meters</li><li><strong>Ghagra / Salwar:</strong> 4.00 meters</li><li><strong>Odhni / Dupatta:</strong> 2.50 meters</li><li><strong>Craft &amp; Care:</strong> Handcrafted zari work · Dry clean only</li></ul>";

type Draft = {
  name: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  fabric: string;
  tag: string;
  images: string[];
  coverImage: string;
  description: string;
  longDescription: string;
};

const emptyDraft: Draft = {
  name: "",
  categorySlug: categories[0].slug,
  price: 0,
  compareAtPrice: 0,
  stock: 0,
  fabric: "Silk blend with zari work",
  tag: "New arrival",
  images: [],
  coverImage: "",
  description: "",
  longDescription: "<p></p>",
};

async function uploadProductImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/products/upload", {
    method: "POST",
    body: formData,
  });
  const payload = (await response.json().catch(() => null)) as {
    success?: boolean;
    data?: { url?: string };
    error?: { message?: string };
  } | null;

  if (!response.ok || !payload?.success || !payload.data?.url) {
    throw new Error(payload?.error?.message ?? `Failed to upload ${file.name}`);
  }
  return payload.data.url;
}

export function ProductManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<StoreProduct[]>(demoProducts);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"add" | "edit" | "view" | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [hasCustomState, setHasCustomState] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageError, setImageError] = useState("");
  const [editorSessionKey, setEditorSessionKey] = useState(0);
  const [categoryOptions, setCategoryOptions] = useState<MasterItem[]>(
    defaultMasterStore.category.filter((item) => item.status === "active"),
  );
  const [fabricOptions, setFabricOptions] = useState<MasterItem[]>(
    defaultMasterStore.fabric.filter((item) => item.status === "active"),
  );
  const [tagOptions, setTagOptions] = useState<MasterItem[]>(
    defaultMasterStore.tag.filter((item) => item.status === "active"),
  );

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(ADMIN_PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed as StoreProduct[]);
          setHasCustomState(true);
        }
      }
    } catch {
      // Ignore malformed cache
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      masterApiService.list("category", "active"),
      masterApiService.list("fabric", "active"),
      masterApiService.list("tag", "active"),
    ])
      .then(([cats, fabs, tags]) => {
        if (cancelled) return;
        if (cats.length) setCategoryOptions(cats);
        if (fabs.length) setFabricOptions(fabs);
        if (tags.length) setTagOptions(tags);
      })
      .catch(() => {
        // Keep seeded active options if API unavailable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dialog) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDialog(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog]);

  function persistProducts(next: StoreProduct[]) {
    setProducts(next);
    setHasCustomState(true);
    try {
      window.localStorage.setItem(
        ADMIN_PRODUCTS_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // Ignore quota errors
    }
  }

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
    setImageError("");
    setDraft({
      ...emptyDraft,
      categorySlug: categoryOptions[0]?.slug ?? categories[0].slug,
      fabric: fabricOptions[0]?.name ?? emptyDraft.fabric,
      tag: tagOptions[0]?.name ?? emptyDraft.tag,
    });
    setActiveId(null);
    setEditorSessionKey((k) => k + 1);
    setDialog("add");
  }

  function startEdit(product: StoreProduct) {
    setImageError("");
    setActiveId(product.id);
    const existingGallery = Array.from(
      new Set([product.image, ...(product.images ?? [])].filter(Boolean)),
    ).slice(0, MAX_PRODUCT_IMAGES);

    setDraft({
      name: product.name,
      categorySlug: product.categorySlug,
      price: product.price,
      compareAtPrice: product.compareAtPrice ?? 0,
      stock: product.stock,
      fabric: product.fabric,
      tag: product.tag,
      images: existingGallery,
      coverImage: product.image,
      description: product.description,
      longDescription:
        product.longDescription || `<p>${product.description}</p>`,
    });
    setEditorSessionKey((k) => k + 1);
    setDialog("edit");
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

  function adjustStock(productId: string, delta: number) {
    const next = products.map((product) =>
      product.id === productId
        ? { ...product, stock: Math.max(0, product.stock + delta) }
        : product,
    );
    persistProducts(next);
  }

  function deleteProduct(productId: string) {
    const next = products.filter((product) => product.id !== productId);
    persistProducts(next);
    if (activeId === productId) setDialog(null);
  }

  function resetCatalog() {
    setProducts(demoProducts);
    setHasCustomState(false);
    try {
      window.localStorage.removeItem(ADMIN_PRODUCTS_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.images.length === 0) {
      setImageError("Please upload at least 1 product image (up to 4).");
      return;
    }

    const coverImage = draft.images.includes(draft.coverImage)
      ? draft.coverImage
      : draft.images[0];
    const galleryImages = [
      coverImage,
      ...draft.images.filter((url) => url !== coverImage),
    ].slice(0, MAX_PRODUCT_IMAGES);

    const matchedCategory =
      categoryOptions.find((item) => item.slug === draft.categorySlug) ??
      categories.find((item) => item.slug === draft.categorySlug) ??
      categoryOptions[0] ??
      categories[0];
    const compareAtPrice =
      Number(draft.compareAtPrice) > Number(draft.price)
        ? Number(draft.compareAtPrice)
        : undefined;

    const normalizedLong = normalizeRichContentInput(
      draft.longDescription || draft.description,
    );

    if (dialog === "edit" && activeId) {
      const next = products.map((product) =>
        product.id === activeId
          ? {
              ...product,
              name: draft.name.trim(),
              category: matchedCategory.name,
              categorySlug: matchedCategory.slug,
              price: Number(draft.price),
              compareAtPrice,
              stock: Math.max(0, Number(draft.stock)),
              fabric: draft.fabric.trim() || "Hand-finished",
              tag: draft.tag.trim() || "Atelier pick",
              image: coverImage,
              images: galleryImages,
              description: draft.description.trim(),
              longDescription: normalizedLong,
            }
          : product,
      );
      persistProducts(next);
    } else {
      const slug =
        draft.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `piece-${Date.now()}`;
      const next: StoreProduct[] = [
        ...products,
        {
          id: `rg-${String(Date.now()).slice(-4)}`,
          slug,
          name: draft.name.trim(),
          category: matchedCategory.name,
          categorySlug: matchedCategory.slug,
          price: Number(draft.price),
          compareAtPrice,
          stock: Math.max(0, Number(draft.stock)),
          image: coverImage,
          images: galleryImages,
          tag: draft.tag.trim() || "New arrival",
          fabric: draft.fabric.trim() || "Hand-finished",
          description: draft.description.trim(),
          longDescription: normalizedLong,
        },
      ];
      persistProducts(next);
    }
    setDialog(null);
  }

  return (
    <section className="container mx-auto px-4 py-7 sm:px-6 lg:py-10">
      <div className="flex flex-col justify-between gap-5 border-b border-[#dfd8cf] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a44436]">
            Catalog · Product & stock management
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#39231e]">Products</h1>
          <p className="mt-2 max-w-xl text-sm text-[#776f68]">
            Create, view and edit products. Manage available stock right here
            alongside each product.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasCustomState && (
            <button
              type="button"
              onClick={resetCatalog}
              className="inline-flex items-center justify-center gap-2 border border-[#dfd8cf] bg-white px-3 py-3 text-xs text-[#776f68] hover:border-[#8d3428]"
            >
              <RotateCcw size={14} /> Reset catalog
            </button>
          )}
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center justify-center gap-2 bg-[#8d3428] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#70281f]"
          >
            <Plus size={15} /> Add product
          </button>
        </div>
      </div>

      <div className="mt-7 overflow-hidden border border-[#dfd8cf] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#eee8e0] p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 border border-[#dfd8cf] px-3 py-2 text-sm text-[#a49a90]">
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
              className="w-full bg-transparent text-sm text-[#39231e] outline-none sm:w-56"
            />
          </label>
          <span className="text-xs text-[#a49a90]">
            {visibleProducts.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#faf7f3] text-[10px] uppercase tracking-[0.12em] text-[#a48668]">
              <tr>
                {["Product", "Category", "Price", "Stock", "Actions"].map(
                  (label) => (
                    <th key={label} className="px-4 py-4 font-semibold sm:px-5">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {pagination.paginatedItems.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-[#eee8e0] text-[#5f5750]"
                >
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden bg-[#f2e9df]">
                        <BlogCoverImage
                          src={product.image}
                          alt={product.name}
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[#39231e]">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-[#9b8d80]">
                          SKU {product.id.toUpperCase()} · {product.tag}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-5">{product.category}</td>
                  <td className="px-4 py-3 sm:px-5">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustStock(product.id, -1)}
                        disabled={product.stock <= 0}
                        aria-label={`Decrease stock for ${product.name}`}
                        className="border border-[#e4dbd1] p-1 disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        className={`min-w-20 text-center text-xs font-medium ${
                          product.stock < 5
                            ? "text-[#a44436]"
                            : "text-[#356b4e]"
                        }`}
                      >
                        {product.stock} in stock
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustStock(product.id, 1)}
                        aria-label={`Increase stock for ${product.name}`}
                        className="border border-[#e4dbd1] p-1"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(product.id);
                          setDialog("view");
                        }}
                        aria-label={`View ${product.name}`}
                        className="border border-[#e4dbd1] p-2 hover:border-[#8d3428]"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(product)}
                        aria-label={`Edit ${product.name}`}
                        className="border border-[#e4dbd1] p-2 hover:border-[#8d3428]"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProduct(product.id)}
                        aria-label={`Delete ${product.name}`}
                        className="border border-[#e4dbd1] p-2 text-[#a44436] hover:border-[#a44436]"
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
        {!visibleProducts.length && (
          <p className="p-8 text-center text-sm text-[#77675d]">
            No products match that search.
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

      <p className="mt-3 text-[10px] leading-5 text-[#8b796b]">
        Demo admin: product changes persist in your browser&apos;s localStorage;
        no database is connected.
      </p>

      {dialog && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#201915]/50 sm:items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            className="max-h-[92vh] w-full overflow-y-auto bg-[#fffdf9] p-5 sm:max-w-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#a44436]">
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
                className="p-2"
              >
                <X size={18} />
              </button>
            </div>

            {dialog === "view" && activeProduct ? (
              <div className="mt-5">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#eee4d8]">
                  <BlogCoverImage
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    sizes="(max-width: 640px) 100vw, 560px"
                    className="object-cover"
                  />
                </div>
                {activeProduct.images && activeProduct.images.length > 1 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {activeProduct.images.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className={`relative aspect-[3/4] overflow-hidden border ${
                          imgUrl === activeProduct.image
                            ? "border-[#8d3428]"
                            : "border-[#e8ded2]"
                        } bg-[#f2e9df]`}
                      >
                        <BlogCoverImage
                          src={imgUrl}
                          alt={`${activeProduct.name} ${idx + 1}`}
                          sizes="120px"
                          className="object-cover"
                        />
                        {imgUrl === activeProduct.image && (
                          <span className="absolute left-1 top-1 bg-[#39231e]/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <h3 className="mt-4 font-serif text-2xl">
                  {activeProduct.name}
                </h3>
                <p className="mt-1 text-sm">
                  {activeProduct.category} · {formatPrice(activeProduct.price)}
                </p>
                <p className="mt-2 text-sm text-[#77675d]">
                  {activeProduct.description}
                </p>
                <div className="mt-4 space-y-1 border-t border-[#e8ded2] pt-4 text-xs text-[#77675d]">
                  <p>
                    Fabric:{" "}
                    <strong className="text-[#33251f]">
                      {activeProduct.fabric}
                    </strong>
                  </p>
                  <p>
                    Available stock:{" "}
                    <strong className="text-[#33251f]">
                      {activeProduct.stock}
                    </strong>
                  </p>
                </div>
                {activeProduct.longDescription && (
                  <div className="mt-5 border-t border-[#e8ded2] pt-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a44436]">
                      Product details
                    </p>
                    <BlogRichContent
                      html={normalizeRichContentInput(
                        activeProduct.longDescription,
                      )}
                      className="text-sm"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(activeProduct)}
                  className="mt-5 bg-[#39231e] px-5 py-3 text-[10px] uppercase tracking-wider text-white"
                >
                  Edit product
                </button>
              </div>
            ) : (
              <form onSubmit={saveProduct} className="mt-5 flex flex-col gap-4">
                <label className="text-xs">
                  Product name
                  <input
                    required
                    value={draft.name}
                    onChange={(event) =>
                      setDraft({ ...draft, name: event.target.value })
                    }
                    className="mt-2 w-full border border-[#ded3c7] bg-white px-3 py-3 text-sm"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="text-xs">
                    Category
                    <select
                      value={draft.categorySlug}
                      onChange={(event) =>
                        setDraft({ ...draft, categorySlug: event.target.value })
                      }
                      className="mt-2 w-full border border-[#ded3c7] bg-white px-3 py-3 text-sm"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category.slug} value={category.slug}>
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
                    Fabric
                    <select
                      value={draft.fabric}
                      onChange={(event) =>
                        setDraft({ ...draft, fabric: event.target.value })
                      }
                      className="mt-2 w-full border border-[#ded3c7] bg-white px-3 py-3 text-sm"
                    >
                      {fabricOptions.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                      {draft.fabric &&
                        !fabricOptions.some(
                          (item) => item.name === draft.fabric,
                        ) && (
                          <option value={draft.fabric}>{draft.fabric}</option>
                        )}
                    </select>
                  </label>
                  <label className="text-xs">
                    Tag
                    <select
                      value={draft.tag}
                      onChange={(event) =>
                        setDraft({ ...draft, tag: event.target.value })
                      }
                      className="mt-2 w-full border border-[#ded3c7] bg-white px-3 py-3 text-sm"
                    >
                      {tagOptions.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                      {draft.tag &&
                        !tagOptions.some((item) => item.name === draft.tag) && (
                          <option value={draft.tag}>{draft.tag}</option>
                        )}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <label className="text-xs">
                    Price (Rs.)
                    <input
                      required
                      type="number"
                      min="0"
                      value={draft.price || ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          price: Number(event.target.value),
                        })
                      }
                      className="mt-2 w-full border border-[#ded3c7] bg-white px-3 py-3 text-sm"
                    />
                  </label>
                  <label className="text-xs">
                    Compare at (Rs.)
                    <input
                      type="number"
                      min="0"
                      value={draft.compareAtPrice || ""}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          compareAtPrice: Number(event.target.value),
                        })
                      }
                      placeholder="Optional"
                      className="mt-2 w-full border border-[#ded3c7] bg-white px-3 py-3 text-sm"
                    />
                  </label>
                  <label className="text-xs">
                    Available stock
                    <input
                      required
                      type="number"
                      min="0"
                      value={draft.stock}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          stock: Number(event.target.value),
                        })
                      }
                      className="mt-2 w-full border border-[#ded3c7] bg-white px-3 py-3 text-sm"
                    />
                  </label>
                </div>

                <div className="border border-[#e4dbd1] bg-[#faf7f3] p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-[#39231e]">
                        Product Images ({draft.images.length}/
                        {MAX_PRODUCT_IMAGES})
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#77675d]">
                        Upload up to 4 images and select which one is the cover
                        image.
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
                        className="inline-flex items-center gap-1.5 border border-[#39231e] bg-white px-3 py-2 text-xs font-medium text-[#39231e] transition hover:bg-[#39231e] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
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
                    <p className="mt-2 text-xs text-[#a44436]">{imageError}</p>
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
                                ? "border-[#8d3428] ring-1 ring-[#8d3428]"
                                : "border-[#ded3c7]"
                            }`}
                          >
                            <div className="relative aspect-[3/4] bg-[#eee4d8]">
                              <BlogCoverImage
                                src={imgUrl}
                                alt={`Product preview ${index + 1}`}
                                sizes="140px"
                                className="object-cover"
                              />
                              {isCover && (
                                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 bg-[#8d3428] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
                                  <Star size={9} fill="currentColor" />
                                  Cover
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeDraftImage(imgUrl)}
                                aria-label={`Remove image ${index + 1}`}
                                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-white/95 text-[#39231e] shadow-sm transition hover:bg-[#a44436] hover:text-white"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDraftCover(imgUrl)}
                              className={`flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                                isCover
                                  ? "bg-[#39231e] text-white"
                                  : "bg-[#faf7f3] text-[#5f5750] hover:bg-[#f2e9df] hover:text-[#39231e]"
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
                      className="mt-3 flex w-full flex-col items-center justify-center gap-1.5 border border-dashed border-[#c9b9a7] bg-white px-4 py-7 text-center text-xs text-[#77675d] transition hover:border-[#8d3428] hover:text-[#39231e]"
                    >
                      <Upload size={18} className="text-[#a44436]" />
                      <span className="font-medium text-[#39231e]">
                        Click to upload product photos (1 to 4 images)
                      </span>
                      <span className="text-[11px] text-[#9b8d80]">
                        PNG, JPG, WEBP or AVIF · Max 4 MB per image
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
                    className="mt-2 w-full border border-[#ded3c7] bg-white px-3 py-2.5 text-sm"
                  />
                </label>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-[#39231e]">
                        Long description / Product details (Rich Text)
                      </span>
                      <p className="mt-0.5 text-[11px] text-[#77675d]">
                        Add bullet lists for garment pieces &amp; meter lengths
                        (e.g., Kurti 2.25m, Ghagra 4.0m, Odhni 2.5m).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={insertMeterTemplate}
                      className="border border-[#ded3c7] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#8d3428] transition hover:border-[#8d3428]"
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
                    uploadUrl="/api/products/upload"
                    minHeightClass="min-h-[190px] max-h-[340px]"
                    ariaLabel="Long description rich text editor"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDialog(null)}
                    className="border border-[#ded3c7] px-4 py-3 text-[10px] uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImages}
                    className="bg-[#39231e] px-5 py-3 text-[10px] uppercase tracking-wider text-white disabled:opacity-50"
                  >
                    {dialog === "add" ? "Create product" : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
