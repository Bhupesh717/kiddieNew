import fs from "node:fs";
import path from "node:path";
import {
  defaultBanners,
  type BannerStatus,
  type StoreBanner,
  type StoreBannerInput,
} from "@/src/lib/store/banners";

const DATA_DIR = path.join(process.cwd(), ".data");
const BANNERS_FILE = path.join(DATA_DIR, "banners.json");

type BannerStoreGlobal = typeof globalThis & {
  __majisaveshBanners?: StoreBanner[];
};

const globalStore = globalThis as BannerStoreGlobal;

function cloneDefaults(): StoreBanner[] {
  return defaultBanners.map((banner) => ({ ...banner }));
}

function normalizeAndSort(banners: StoreBanner[]): StoreBanner[] {
  return [...banners]
    .map((banner, idx) => ({
      ...banner,
      order:
        typeof banner.order === "number" &&
        Number.isFinite(banner.order) &&
        banner.order >= 1
          ? Math.floor(banner.order)
          : idx + 1,
    }))
    .sort((a, b) => a.order - b.order);
}

function readPersistedBanners(): StoreBanner[] {
  if (globalStore.__majisaveshBanners) {
    return globalStore.__majisaveshBanners;
  }

  try {
    if (fs.existsSync(BANNERS_FILE)) {
      const raw = fs.readFileSync(BANNERS_FILE, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalStore.__majisaveshBanners = normalizeAndSort(
          parsed as StoreBanner[],
        );
        return globalStore.__majisaveshBanners;
      }
    }
  } catch {
    // Fall back to default banner if disk storage is unavailable
  }

  globalStore.__majisaveshBanners = cloneDefaults();
  return globalStore.__majisaveshBanners;
}

function writePersistedBanners(banners: StoreBanner[]): StoreBanner[] {
  const sorted = normalizeAndSort(banners);
  globalStore.__majisaveshBanners = sorted;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(BANNERS_FILE, JSON.stringify(sorted, null, 2), "utf8");
  } catch {
    // Keep in-memory state when filesystem is read-only
  }
  return sorted;
}

export function listBanners(
  statusFilter: BannerStatus | "all" = "all",
): StoreBanner[] {
  const banners = readPersistedBanners();
  if (statusFilter === "all") return banners;
  return banners.filter((banner) => banner.status === statusFilter);
}

export function getActiveBanners(): StoreBanner[] {
  return listBanners("active");
}

export function createBanner(input: StoreBannerInput): StoreBanner {
  const banners = readPersistedBanners();
  const id = input.id?.trim() || `banner-${Date.now()}`;
  const maxOrder = banners.reduce(
    (max, item) => Math.max(max, item.order),
    0,
  );
  const order =
    typeof input.order === "number" &&
    Number.isFinite(input.order) &&
    input.order >= 1
      ? Math.floor(input.order)
      : maxOrder + 1;

  const created: StoreBanner = {
    id,
    image: input.image.trim(),
    order,
    status: input.status === "inactive" ? "inactive" : "active",
    updatedAt: new Date().toISOString(),
  };

  writePersistedBanners([...banners, created]);
  return created;
}

export function updateBanner(
  id: string,
  patch: Partial<StoreBannerInput>,
): StoreBanner | null {
  const banners = readPersistedBanners();
  const index = banners.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = banners[index];
  const updated: StoreBanner = {
    ...current,
    image:
      patch.image !== undefined
        ? patch.image.trim() || current.image
        : current.image,
    order:
      patch.order !== undefined &&
      Number.isFinite(patch.order) &&
      patch.order >= 1
        ? Math.floor(patch.order)
        : current.order,
    status:
      patch.status === "active" || patch.status === "inactive"
        ? patch.status
        : current.status,
    updatedAt: new Date().toISOString(),
  };

  const nextBanners = [...banners];
  nextBanners[index] = updated;
  writePersistedBanners(nextBanners);
  return updated;
}

export function moveBannerOrder(
  id: string,
  direction: "up" | "down",
): StoreBanner[] | null {
  const sorted = normalizeAndSort(readPersistedBanners());
  const index = sorted.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) {
    return sorted;
  }

  const reordered = [...sorted];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, moved);

  const normalized = reordered.map((item, idx) => ({
    ...item,
    order: idx + 1,
    updatedAt:
      item.id === id || item.id === sorted[targetIndex].id
        ? new Date().toISOString()
        : item.updatedAt,
  }));

  return writePersistedBanners(normalized);
}

export function deleteBanner(id: string): StoreBanner | null {
  const banners = readPersistedBanners();
  const target = banners.find((item) => item.id === id);
  if (!target) return null;

  writePersistedBanners(banners.filter((item) => item.id !== id));
  return target;
}

export function resetBannersToDefaults(): StoreBanner[] {
  const defaults = cloneDefaults();
  writePersistedBanners(defaults);
  return defaults;
}
