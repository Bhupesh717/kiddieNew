import fs from "node:fs";
import path from "node:path";
import {
  AVAILABLE_CATEGORY_IMAGES,
  MASTER_TYPES,
  defaultMasterStore,
  slugifyMasterName,
  type MasterItem,
  type MasterItemInput,
  type MasterStatus,
  type MasterType,
} from "@/src/lib/store/masters";

const DATA_DIR = path.join(process.cwd(), ".data");
const MASTERS_FILE = path.join(DATA_DIR, "masters.json");

type MasterStoreMap = Record<MasterType, MasterItem[]>;

type MasterStoreGlobal = typeof globalThis & {
  __majisaveshMasterStore?: MasterStoreMap;
};

const globalStore = globalThis as MasterStoreGlobal;

function cloneDefaults(): MasterStoreMap {
  return {
    category: defaultMasterStore.category.map((item) => ({ ...item })),
    fabric: defaultMasterStore.fabric.map((item) => ({ ...item })),
    tag: defaultMasterStore.tag.map((item) => ({ ...item })),
  };
}

function readStore(): MasterStoreMap {
  if (globalStore.__majisaveshMasterStore) {
    return globalStore.__majisaveshMasterStore;
  }

  try {
    if (fs.existsSync(MASTERS_FILE)) {
      const raw = fs.readFileSync(MASTERS_FILE, "utf8");
      const parsed = JSON.parse(raw) as Partial<MasterStoreMap> | null;
      if (parsed && typeof parsed === "object") {
        const defaults = cloneDefaults();
        const hydrated: MasterStoreMap = {
          category: Array.isArray(parsed.category)
            ? parsed.category
            : defaults.category,
          fabric: Array.isArray(parsed.fabric)
            ? parsed.fabric
            : defaults.fabric,
          tag: Array.isArray(parsed.tag) ? parsed.tag : defaults.tag,
        };
        globalStore.__majisaveshMasterStore = hydrated;
        return hydrated;
      }
    }
  } catch {
    // Fall back cleanly to seeded defaults
  }

  globalStore.__majisaveshMasterStore = cloneDefaults();
  return globalStore.__majisaveshMasterStore;
}

function writeStore(store: MasterStoreMap): MasterStoreMap {
  globalStore.__majisaveshMasterStore = store;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(MASTERS_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Ignore read-only filesystem errors
  }
  return store;
}

function ensureUniqueSlug(
  rawSlug: string,
  items: MasterItem[],
  excludeId?: string,
): string {
  const base = slugifyMasterName(rawSlug);
  const existing = new Set(
    items.filter((item) => item.id !== excludeId).map((item) => item.slug),
  );
  if (!existing.has(base)) return base;

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export function listMasterItems(
  type: MasterType,
  status: MasterStatus | "all" = "all",
): MasterItem[] {
  const items = readStore()[type] ?? [];
  if (status === "all") return items;
  return items.filter((item) => item.status === status);
}

export function getMasterSummary() {
  const store = readStore();
  return MASTER_TYPES.map((type) => {
    const list = store[type] ?? [];
    const active = list.filter((item) => item.status === "active").length;
    return {
      type,
      total: list.length,
      active,
      inactive: list.length - active,
    };
  });
}

export function createMasterItem(
  type: MasterType,
  input: MasterItemInput,
): MasterItem {
  const store = readStore();
  const list = store[type] ?? [];
  const id = `${type.slice(0, 3)}-${Date.now()}`;
  const name = input.name.trim();
  const slug = ensureUniqueSlug(input.slug?.trim() || name, list, id);

  const created: MasterItem = {
    id,
    type,
    name,
    slug,
    description: input.description?.trim() ?? "",
    ...(type === "category"
      ? {
          image:
            input.image?.trim() || AVAILABLE_CATEGORY_IMAGES[0].value,
        }
      : {}),
    status: input.status === "inactive" ? "inactive" : "active",
    updatedAt: new Date().toISOString(),
  };

  writeStore({
    ...store,
    [type]: [created, ...list],
  });
  return created;
}

export function updateMasterItem(
  type: MasterType,
  id: string,
  patch: Partial<MasterItemInput>,
): MasterItem | null {
  const store = readStore();
  const list = store[type] ?? [];
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = list[index];
  const nextName =
    patch.name !== undefined ? patch.name.trim() || current.name : current.name;
  const nextSlug =
    patch.slug !== undefined
      ? ensureUniqueSlug(patch.slug || nextName, list, current.id)
      : current.slug;

  const updated: MasterItem = {
    ...current,
    name: nextName,
    slug: nextSlug,
    description:
      patch.description !== undefined
        ? patch.description.trim()
        : current.description,
    ...(type === "category"
      ? {
          image:
            patch.image !== undefined
              ? patch.image.trim() || current.image
              : current.image,
        }
      : {}),
    status:
      patch.status === "active" || patch.status === "inactive"
        ? patch.status
        : current.status,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...list];
  nextList[index] = updated;
  writeStore({
    ...store,
    [type]: nextList,
  });
  return updated;
}

export function deleteMasterItem(
  type: MasterType,
  id: string,
): MasterItem | null {
  const store = readStore();
  const list = store[type] ?? [];
  const target = list.find((item) => item.id === id);
  if (!target) return null;

  writeStore({
    ...store,
    [type]: list.filter((item) => item.id !== id),
  });
  return target;
}

export function resetMasterItems(type: MasterType): MasterItem[] {
  const store = readStore();
  const defaults = cloneDefaults()[type];
  writeStore({
    ...store,
    [type]: defaults,
  });
  return defaults;
}

