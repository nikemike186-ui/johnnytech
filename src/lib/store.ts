import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

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
}
export interface StoreState {
  settings: Settings;
  inventory: Product[];
}

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

export function restoreState(value: unknown): StoreState | null {
  if (!isRecord(value) || !isRecord(value["settings"]) || !Array.isArray(value["inventory"]))
    return null;
  const settings = value["settings"];
  const inventory = value["inventory"];
  if (
    typeof settings["storeName"] !== "string" ||
    typeof settings["tagline"] !== "string" ||
    typeof settings["whatsapp"] !== "string" ||
    !inventory.every(isProduct)
  )
    return null;
  return {
    settings: {
      storeName: settings["storeName"],
      tagline: settings["tagline"],
      whatsapp: settings["whatsapp"],
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

type StoreContextValue = {
  state: StoreState;
  updateStore: (update: (state: StoreState) => StoreState) => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({
  initialState,
  persist,
  children,
}: {
  initialState: StoreState;
  persist: (state: StoreState) => Promise<StoreState>;
  children?: ReactNode;
}) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef(initialState);
  const persistedRef = useRef(initialState);
  const writeQueue = useRef(Promise.resolve());

  useEffect(() => {
    stateRef.current = initialState;
    persistedRef.current = initialState;
    setState(initialState);
  }, [initialState]);

  const updateStore = useCallback(
    (update: (current: StoreState) => StoreState) => {
      const next = update(stateRef.current);
      stateRef.current = next;
      setState(next);
      const write = writeQueue.current.then(async () => {
        try {
          const saved = await persist(next);
          persistedRef.current = saved;
          if (stateRef.current === next) {
            stateRef.current = saved;
            setState(saved);
          }
        } catch (error) {
          if (stateRef.current === next) {
            stateRef.current = persistedRef.current;
            setState(persistedRef.current);
          }
          throw error;
        }
      });
      writeQueue.current = write.catch(() => {});
      return write;
    },
    [persist],
  );

  return createElement(StoreContext.Provider, { value: { state, updateStore } }, children);
}

export function useStore(): StoreState {
  return useContext(StoreContext)?.state ?? defaultState();
}

export function useStoreActions() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("Store actions are only available inside StoreProvider.");
  return context.updateStore;
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
