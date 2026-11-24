import { useSyncExternalStore } from "react";

export type Condition = "new" | "preowned";
export interface ProductBase {
  id: string;
  model: string;
  price: number;
  featured: boolean;
  inStock: boolean;
}
export interface Phone extends ProductBase {
  category: "iphone";
  storage: string;
  condition: Condition;
  battery: number;
  colorName?: string;
  colorHex?: string;
}
export interface SamsungPhone extends ProductBase {
  category: "samsung";
  storage?: string;
  condition: Condition;
}
export interface Tablet extends ProductBase {
  category: "ipad";
  storage: string;
  connectivity: "Wi-Fi" | "Wi-Fi + Cellular";
  condition: Condition;
}
export interface Accessory extends ProductBase {
  category: "accessory";
  accessoryType: string;
  description: string;
  compatibleWith: string;
}
export type Smartphone = Phone | SamsungPhone;
export type Device = Smartphone | Tablet;
export type Product = Device | Accessory;
export interface Settings {
  storeName: string;
  tagline: string;
  whatsapp: string;
  pin: string;
}
export interface StoreState {
  settings: Settings;
  inventory: Product[];
}

const KEY = "johnny-tech-store-v4";
const LEGACY_KEYS = [
  "johnny-tech-store-v3",
  "johnny-tech-store-v2",
  "johnny-tech-store-v1",
] as const;
const LEGACY_PHONE_IDS = new Set(["1", "2", "3", "4", "5", "6", "7", "8"]);
export const DEFAULT_WHATSAPP_NUMBER = "263712279955";

export function defaultState(): StoreState {
  const p = (
    id: string,
    model: string,
    storage: string,
    price: number,
    color?: { colorName: string; colorHex: string },
    featured = false,
  ): Phone => ({
    id,
    model,
    category: "iphone",
    storage,
    condition: "new",
    battery: 100,
    ...color,
    price,
    featured,
    inStock: true,
  });
  const a = (
    id: string,
    model: string,
    accessoryType: string,
    description: string,
    compatibleWith: string,
    price: number,
    featured = false,
  ): Accessory => ({
    id,
    model,
    category: "accessory",
    accessoryType,
    description,
    compatibleWith,
    price,
    featured,
    inStock: true,
  });
  const i = (
    id: string,
    model: string,
    storage: string,
    connectivity: Tablet["connectivity"],
    price: number,
  ): Tablet => ({
    id,
    model,
    category: "ipad",
    storage,
    connectivity,
    condition: "new",
    price,
    featured: false,
    inStock: true,
  });
  const s = (
    id: string,
    model: string,
    storage: string | undefined,
    price: number,
  ): SamsungPhone => ({
    id,
    model,
    category: "samsung",
    ...(storage ? { storage } : {}),
    condition: "new",
    price,
    featured: false,
    inStock: true,
  });
  return {
    settings: {
      storeName: "Johnny Tech",
      tagline: "Your Next Phone. New or Certified Pre-Owned.",
      whatsapp: DEFAULT_WHATSAPP_NUMBER,
      pin: "1234",
    },
    inventory: [
      p("iphone-11-pro-max-256", "iPhone 11 Pro Max", "256GB", 320),
      p("iphone-12-128", "iPhone 12", "128GB", 280),
      p("iphone-12-pro-128", "iPhone 12 Pro", "128GB", 350),
      p("iphone-12-pro-256", "iPhone 12 Pro", "256GB", 380),
      p("iphone-12-pro-max-128", "iPhone 12 Pro Max", "128GB", 390),
      p("iphone-12-pro-max-256", "iPhone 12 Pro Max", "256GB", 430),
      p("iphone-13-128", "iPhone 13", "128GB", 340),
      p("iphone-13-pro-128", "iPhone 13 Pro", "128GB", 440),
      p("iphone-13-pro-256", "iPhone 13 Pro", "256GB", 490),
      p("iphone-13-pro-max-128", "iPhone 13 Pro Max", "128GB", 500),
      p("iphone-13-pro-max-256", "iPhone 13 Pro Max", "256GB", 530),
      p("iphone-14-128", "iPhone 14", "128GB", 420),
      p("iphone-14-256", "iPhone 14", "256GB", 460),
      p("iphone-14-plus-128", "iPhone 14 Plus", "128GB", 440),
      p("iphone-14-plus-256", "iPhone 14 Plus", "256GB", 470),
      p("iphone-14-pro-128", "iPhone 14 Pro", "128GB", 530),
      p("iphone-14-pro-256", "iPhone 14 Pro", "256GB", 550, undefined, true),
      p("iphone-14-pro-max-128", "iPhone 14 Pro Max", "128GB", 550),
      p("iphone-14-pro-max-256", "iPhone 14 Pro Max", "256GB", 570),
      p("iphone-15-128", "iPhone 15", "128GB", 550),
      p("iphone-15-256", "iPhone 15", "256GB", 580),
      p("iphone-15-plus-128", "iPhone 15 Plus", "128GB", 590),
      p("iphone-15-plus-256", "iPhone 15 Plus", "256GB", 630),
      p("iphone-15-pro-max-256", "iPhone 15 Pro Max", "256GB", 730, undefined, true),
      p("iphone-16-128", "iPhone 16", "128GB", 800),
      p("iphone-16-256", "iPhone 16", "256GB", 820),
      p("iphone-16-plus-128", "iPhone 16 Plus", "128GB", 850),
      p("iphone-16-plus-256", "iPhone 16 Plus", "256GB", 880),
      p("iphone-16-pro-128", "iPhone 16 Pro", "128GB", 900, undefined, true),
      p("iphone-16-pro-256", "iPhone 16 Pro", "256GB", 950),
      p("iphone-16-pro-max-256", "iPhone 16 Pro Max", "256GB", 1200, undefined, true),
      p("iphone-17-pro-max-256", "iPhone 17 Pro Max", "256GB", 1550),
      p("iphone-18-pro-max-256-blue", "iPhone 18 Pro Max", "256GB", 1780, {
        colorName: "Blue",
        colorHex: "#405F9B",
      }),
      p("iphone-18-pro-max-256-burgundy", "iPhone 18 Pro Max", "256GB", 1900, {
        colorName: "Burgundy",
        colorHex: "#762F45",
      }),
      p("iphone-18-pro-max-512", "iPhone 18 Pro Max", "512GB", 2200),
      p("iphone-18-pro-max-1tb", "iPhone 18 Pro Max", "1TB", 2200),
      p("iphone-18-pro-max-2tb", "iPhone 18 Pro Max", "2TB", 3300),
      i("ipad-11th-128-wifi", "iPad 11th Gen", "128GB", "Wi-Fi", 550),
      i("ipad-11th-128-cellular", "iPad 11th Gen", "128GB", "Wi-Fi + Cellular", 650),
      i("ipad-11th-256-wifi", "iPad 11th Gen", "256GB", "Wi-Fi", 650),
      a(
        "9",
        "MagSafe Power Pack",
        "Power",
        "Portable magnetic charging for your iPhone on the go.",
        "iPhone 12 and newer",
        79,
        true,
      ),
      a(
        "10",
        "20W USB-C Fast Charger",
        "Charger",
        "Compact fast charger with a USB-C port.",
        "USB-C devices",
        25,
      ),
      a(
        "11",
        "Tempered Glass Screen Guard",
        "Screen Protection",
        "Scratch-resistant tempered glass with an easy-fit applicator.",
        "iPhone 15 Pro",
        12,
      ),
      a(
        "12",
        "Wireless Noise-Cancelling Earbuds",
        "Audio",
        "Wireless audio with a compact charging case.",
        "Bluetooth devices",
        89,
        true,
      ),
      s("samsung-a07-4-64", "Samsung A07", "4/64GB", 140),
      s("samsung-a07-4-128", "Samsung A07", "4/128GB", 160),
      s("samsung-a17-4-128", "Samsung A17", "4/128GB", 200),
      s("samsung-a26-6-128", "Samsung A26", "6/128GB", 280),
      s("samsung-m36-6-128", "Samsung M36", "6/128GB", 280),
      s("samsung-a36-6-128", "Samsung A36", "6/128GB", 300),
      s("samsung-m56-8-128", "Samsung M56", "8/128GB", 350),
      s("samsung-a56-8-128", "Samsung A56", "8/128GB", 380),
      s("samsung-a56-6-256", "Samsung A56", "6/256GB", 470),
      s("samsung-a57-8-128", "Samsung A57", "8/128GB", 480),
      s("samsung-a51-8-256", "Samsung A51", "8/256GB", 490),
      s("samsung-s20-fe-128", "Samsung S20 FE", "128GB", 170),
      s("samsung-s20-plus-128", "Samsung S20 Plus", "128GB", 200),
      s("samsung-s21-ultra-128", "Samsung S21 Ultra", "128GB", 290),
      s("samsung-s22-ultra-128", "Samsung S22 Ultra", "128GB", 380),
      s("samsung-s22-ultra-256", "Samsung S22 Ultra", "256GB", 420),
      s("samsung-s23-ultra-256", "Samsung S23 Ultra", "256GB", 520),
      s("samsung-s23-ultra-512", "Samsung S23 Ultra", "512GB", 589),
      s("samsung-s24-256", "Samsung S24", "256GB", 530),
      s("samsung-s24-plus-256", "Samsung S24+", "256GB", 560),
      s("samsung-s24-ultra-256", "Samsung S24 Ultra", "256GB", 720),
      s("samsung-s25-ultra-256", "Samsung S25 Ultra", "256GB", 900),
      s("samsung-s25-ultra-512", "Samsung S25 Ultra", "512GB", 950),
      s("samsung-s26-ultra-256", "Samsung S26 Ultra", "256GB", 1100),
      s("samsung-s26-ultra-512", "Samsung S26 Ultra", "512GB", 1200),
      s("samsung-z-flip-4", "Samsung Galaxy Z Flip 4", undefined, 300),
      s("samsung-z-flip-5-256", "Samsung Galaxy Z Flip 5", "256GB", 450),
      s("samsung-z-flip-6-256", "Samsung Galaxy Z Flip 6", "256GB", 560),
      s("samsung-z-fold-4-256", "Samsung Galaxy Z Fold 4", "256GB", 620),
      s("samsung-z-fold-5-256", "Samsung Galaxy Z Fold 5", "256GB", 720),
      s("samsung-z-fold-6-256", "Samsung Galaxy Z Fold 6", "256GB", 900),
      s("samsung-z-fold-7-256", "Samsung Galaxy Z Fold 7", "256GB", 1650),
      s("samsung-z-fold-8-256", "Samsung Galaxy Z Fold 8", "256GB", 1850),
    ],
  };
}

let cache: StoreState | null = null;
const listeners = new Set<() => void>();
const serverSnap = defaultState();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type StoredProduct = Product | (Omit<Phone, "category"> & { category?: undefined });

function isProduct(value: unknown): value is StoredProduct {
  if (
    !isRecord(value) ||
    typeof value["id"] !== "string" ||
    typeof value["model"] !== "string" ||
    typeof value["price"] !== "number" ||
    typeof value["featured"] !== "boolean" ||
    typeof value["inStock"] !== "boolean"
  )
    return false;
  if (value["category"] === "accessory") {
    return (
      typeof value["accessoryType"] === "string" &&
      typeof value["description"] === "string" &&
      typeof value["compatibleWith"] === "string"
    );
  }
  if (value["category"] === "samsung") {
    return (
      (value["storage"] === undefined || typeof value["storage"] === "string") &&
      (value["condition"] === "new" || value["condition"] === "preowned")
    );
  }
  if (value["category"] === "ipad") {
    return (
      typeof value["storage"] === "string" &&
      (value["connectivity"] === "Wi-Fi" || value["connectivity"] === "Wi-Fi + Cellular") &&
      (value["condition"] === "new" || value["condition"] === "preowned")
    );
  }
  return (
    (value["category"] === "iphone" || value["category"] === undefined) &&
    typeof value["storage"] === "string" &&
    (value["condition"] === "new" || value["condition"] === "preowned") &&
    typeof value["battery"] === "number" &&
    (value["colorName"] === undefined || typeof value["colorName"] === "string") &&
    (value["colorHex"] === undefined || typeof value["colorHex"] === "string")
  );
}

function restoreState(value: unknown): StoreState | null {
  if (!isRecord(value) || !isRecord(value["settings"]) || !Array.isArray(value["inventory"]))
    return null;
  const settings = value["settings"];
  const inventory = value["inventory"];
  if (
    typeof settings["storeName"] !== "string" ||
    typeof settings["tagline"] !== "string" ||
    typeof settings["whatsapp"] !== "string" ||
    typeof settings["pin"] !== "string" ||
    !inventory.every(isProduct)
  )
    return null;
  return {
    settings: {
      storeName: settings["storeName"],
      tagline: settings["tagline"],
      whatsapp: settings["whatsapp"],
      pin: settings["pin"],
    },
    inventory: inventory.map((product): Product =>
      product.category === "accessory" ||
      product.category === "samsung" ||
      product.category === "ipad"
        ? product
        : { ...product, category: "iphone" },
    ),
  };
}

function read(): StoreState {
  if (cache) return cache;
  if (typeof window === "undefined") return serverSnap;
  const currentRaw = window.localStorage.getItem(KEY);
  const legacyKey =
    currentRaw === null
      ? LEGACY_KEYS.find((key) => window.localStorage.getItem(key) !== null)
      : undefined;
  const legacyRaw = legacyKey ? window.localStorage.getItem(legacyKey) : null;
  const raw = currentRaw ?? legacyRaw;
  if (raw === null) {
    cache = defaultState();
    return cache;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error("Unable to parse Johnny Tech inventory from localStorage.", error);
    cache = defaultState();
    return cache;
  }
  const restored = restoreState(parsed);
  if (!restored) {
    console.error("Johnny Tech inventory in localStorage has an invalid shape; using defaults.");
    cache = defaultState();
    return cache;
  }
  cache = restored;
  if (legacyRaw !== null) {
    const defaults = defaultState();
    const retainedInventory = cache.inventory.filter(
      (product) => product.category !== "iphone" || !LEGACY_PHONE_IDS.has(product.id),
    );
    const seededIds = new Set(retainedInventory.map((product) => product.id));
    cache = {
      ...cache,
      settings: {
        ...cache.settings,
        whatsapp: defaults.settings.whatsapp,
        tagline:
          cache.settings.tagline === "Your Next iPhone. New or Certified Pre-Owned."
            ? defaults.settings.tagline
            : cache.settings.tagline,
      },
      inventory: [
        ...retainedInventory,
        ...defaults.inventory.filter((product) => !seededIds.has(product.id)),
      ],
    };
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  }
  return cache!;
}
export function setStore(fn: (s: StoreState) => StoreState) {
  const next = fn(read());
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  cache = next;
  listeners.forEach((l) => l());
}
export function resetStore() {
  setStore(() => defaultState());
}
export function useStore(): StoreState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      const h = (e: StorageEvent) => {
        if (e.key === KEY) {
          cache = null;
          l();
        }
      };
      window.addEventListener("storage", h);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", h);
      };
    },
    read,
    () => serverSnap,
  );
}

export const conditionLabel = (c: Condition) =>
  c === "new" ? "Brand New Sealed" : "Certified Pre-Owned";
export const isSmartphone = (product: Product): product is Smartphone =>
  product.category === "iphone" || product.category === "samsung";
export const isDevice = (product: Product): product is Device => product.category !== "accessory";
export const formatPhoneNumber = (number: string) => {
  const digits = number.replace(/\D/g, "");
  if (/^263\d{9}$/.test(digits))
    return `+263 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  return number.trim().startsWith("+") ? number.trim() : `+${digits}`;
};
export const waLink = (num: string, text: string) =>
  `https://wa.me/${num.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
export function buyMessage(product: Product): string {
  const details = isDevice(product)
    ? [
        product.storage ? `Storage: ${product.storage}` : null,
        product.category === "iphone" && product.colorName ? `Finish: ${product.colorName}` : null,
        product.category === "ipad" ? `Connectivity: ${product.connectivity}` : null,
        `Condition: ${conditionLabel(product.condition)}`,
        product.category === "iphone" ? `Battery health: ${product.battery}%` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : `Category: ${product.accessoryType}\nDetails: ${product.description}\nCompatible with: ${product.compatibleWith}`;
  return `Hello Johnny Tech,\n\nI'd like to place an order:\n\nProduct: ${product.model}\n${details}\nPrice: $${product.price.toLocaleString()}\n\nPlease confirm availability and delivery options.\nThank you!`;
}

export const tradeInConditions = {
  mint: {
    label: "Mint / Flawless (90%+ Battery / No Scratches)",
    multiplier: 0.68,
  },
  good: {
    label: "Good / Normal Wear (80–89% Battery)",
    multiplier: 0.58,
  },
  fair: {
    label: "Fair / Minor Scratches or Weak Battery (<80%)",
    multiplier: 0.45,
  },
  cracked: {
    label: "Cracked Screen / Back Glass",
    multiplier: 0.3,
  },
} as const;
export type TradeInCondition = keyof typeof tradeInConditions;
export function estimateTradeInCredit(retailPrice: number, condition: TradeInCondition): number {
  return Math.round((retailPrice * tradeInConditions[condition].multiplier) / 5) * 5;
}
