import { describe, it, expect } from "vitest";
import {
  estimateTradeInCredit,
  defaultState,
  setStore,
  buyMessage,
  formatPhoneNumber,
  waLink,
} from "./store";
import { renderHook } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
    },
  });
});

describe("trade-in valuation", () => {
  it("applies each condition rate to the catalog price", () => {
    expect(estimateTradeInCredit(1000, "mint")).toBe(680);
    expect(estimateTradeInCredit(1000, "good")).toBe(580);
    expect(estimateTradeInCredit(1000, "fair")).toBe(450);
    expect(estimateTradeInCredit(1000, "cracked")).toBe(300);
  });
  it("rounds the estimate to the nearest $5", () =>
    expect(estimateTradeInCredit(323, "mint")).toBe(220));
  it("default admin PIN is 1234", () => expect(defaultState().settings.pin).toBe("1234"));
});

describe("inventory", () => {
  it("seeds the boxed iPhone and iPad catalog with supplied variants and prices", () => {
    const inventory = defaultState().inventory;
    const iphones = inventory.filter((product) => product.category === "iphone");
    const ipads = inventory.filter((product) => product.category === "ipad");
    expect(iphones).toHaveLength(37);
    expect(iphones.every((product) => product.condition === "new" && product.battery === 100)).toBe(
      true,
    );
    expect(iphones.find((product) => product.id === "iphone-11-pro-max-256")?.price).toBe(320);
    expect(iphones.find((product) => product.id === "iphone-16-pro-max-256")?.price).toBe(1200);
    expect(iphones.find((product) => product.id === "iphone-18-pro-max-256-burgundy")?.price).toBe(
      1900,
    );
    expect(iphones.find((product) => product.id === "iphone-18-pro-max-2tb")?.price).toBe(3300);
    expect(ipads).toHaveLength(3);
    expect(ipads.find((product) => product.id === "ipad-11th-128-cellular")).toMatchObject({
      storage: "128GB",
      connectivity: "Wi-Fi + Cellular",
      price: 650,
      condition: "new",
    });
  });
  it("uses the current WhatsApp number for encoded ordering links", () => {
    const number = defaultState().settings.whatsapp;
    expect(number).toBe("263712279955");
    expect(formatPhoneNumber(number)).toBe("+263 71 227 9955");
    const url = waLink(number, "Hello Johnny Tech! I'd like to order.");
    expect(url).toBe(
      "https://wa.me/263712279955?text=Hello%20Johnny%20Tech!%20I'd%20like%20to%20order.",
    );
  });

  it("seeds all Samsung models and prices as brand new devices", () => {
    const samsung = defaultState().inventory.filter((product) => product.category === "samsung");
    expect(samsung).toHaveLength(33);
    expect(samsung.find((product) => product.id === "samsung-a07-4-64")).toMatchObject({
      model: "Samsung A07",
      storage: "4/64GB",
      condition: "new",
      price: 140,
    });
    expect(samsung.find((product) => product.id === "samsung-z-flip-4")).toMatchObject({
      model: "Samsung Galaxy Z Flip 4",
      condition: "new",
      price: 300,
    });
    expect(samsung.find((product) => product.id === "samsung-z-flip-4")).not.toHaveProperty(
      "storage",
    );
  });

  it.each(["v1", "v2", "v3"])(
    "migrates %s localStorage into the current catalog",
    async (version) => {
      const previousState = defaultState();
      const oldPhone = {
        id: "1",
        model: "iPhone 16 Pro Max",
        category: "iphone",
        storage: "256GB",
        condition: "new",
        battery: 100,
        colorName: "Desert Titanium",
        colorHex: "#BFA48F",
        price: 1199,
        featured: true,
        inStock: true,
      };
      const customAccessory = {
        id: "custom-case",
        model: "Custom Case",
        category: "accessory",
        accessoryType: "Case",
        description: "Custom item",
        compatibleWith: "iPhone",
        price: 9,
        featured: false,
        inStock: true,
      };
      storage.set(
        `johnny-tech-store-${version}`,
        JSON.stringify({
          ...previousState,
          settings: {
            ...previousState.settings,
            tagline: "Your Next iPhone. New or Certified Pre-Owned.",
            whatsapp: "+263 71 227 9955",
          },
          inventory: [
            oldPhone,
            customAccessory,
            ...previousState.inventory.filter(
              (product) => product.category === "accessory" || product.category === "samsung",
            ),
          ],
        }),
      );
      await vi.resetModules();
      const migratedStore = await import("./store");
      const { result } = renderHook(() => migratedStore.useStore());
      expect(result.current.settings.whatsapp).toBe("263712279955");
      expect(result.current.settings.tagline).toBe("Your Next Phone. New or Certified Pre-Owned.");
      const iphones = result.current.inventory.filter((product) => product.category === "iphone");
      expect(iphones).toHaveLength(37);
      expect(iphones.find((product) => product.id === "iphone-16-pro-max-256")?.price).toBe(1200);
      expect(result.current.inventory.some((product) => product.id === "custom-case")).toBe(true);
      expect(
        result.current.inventory.filter((product) => product.category === "samsung"),
      ).toHaveLength(33);
      expect(
        result.current.inventory.filter((product) => product.category === "ipad"),
      ).toHaveLength(3);
      expect(storage.has("johnny-tech-store-v4")).toBe(true);
    },
  );

  it("restores accessory inventory from localStorage after a reload", async () => {
    const accessory = defaultState().inventory.find((product) => product.category === "accessory")!;
    setStore((state) => ({ ...state, inventory: [accessory, ...state.inventory] }));
    await vi.resetModules();
    const restoredStore = await import("./store");
    const { result } = renderHook(() => restoredStore.useStore());
    expect(result.current.inventory[0]?.id).toBe(accessory.id);
  });

  it("creates an order summary for iPhones, Samsung phones, and accessories", () => {
    const products = defaultState().inventory;
    const phone = products.find((product) => product.category === "iphone")!;
    const samsung = products.find((product) => product.category === "samsung")!;
    const ipad = products.find((product) => product.category === "ipad")!;
    const accessory = products.find((product) => product.category === "accessory")!;
    expect(buyMessage(phone)).toContain("Battery health: 100%");
    expect(buyMessage(samsung)).toContain("Storage: 4/64GB");
    expect(buyMessage(samsung)).toContain("Condition: Brand New Sealed");
    expect(buyMessage(ipad)).toContain("Connectivity: Wi-Fi");
    expect(buyMessage(accessory)).toContain("Category: Power");
    expect(decodeURIComponent(waLink("263 71 227 9955", buyMessage(accessory)))).toContain(
      "Please confirm availability",
    );
  });
});
