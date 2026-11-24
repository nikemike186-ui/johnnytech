import {
  estimateTradeInCredit,
  defaultState,
  buyMessage,
  formatPhoneNumber,
  restoreState,
  StoreProvider,
  useStore,
  useStoreActions,
  waLink,
} from "./store";
import { act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { createElement, type ReactNode } from "react";

describe("trade-in valuation", () => {
  it("applies each condition rate to the catalog price", () => {
    expect(estimateTradeInCredit(1000, "mint")).toBe(680);
    expect(estimateTradeInCredit(1000, "good")).toBe(580);
    expect(estimateTradeInCredit(1000, "fair")).toBe(450);
    expect(estimateTradeInCredit(1000, "cracked")).toBe(300);
  });
  it("rounds the estimate to the nearest $5", () =>
    expect(estimateTradeInCredit(323, "mint")).toBe(220));
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

  it("restores valid public store data without an admin credential", () => {
    const state = defaultState();
    expect(restoreState(state)).toEqual(state);
    expect(restoreState({ ...state, settings: { ...state.settings, pin: "1234" } })).toEqual(state);
  });

  it("persists provider updates and exposes the latest store state", async () => {
    const initialState = defaultState();
    const persist = vi.fn(async (state: typeof initialState) => state);
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(StoreProvider, { initialState, persist }, children);
    const { result } = renderHook(() => ({ store: useStore(), update: useStoreActions() }), {
      wrapper,
    });

    await act(async () => {
      await result.current.update((state) => ({
        ...state,
        settings: { ...state.settings, storeName: "Updated Store" },
      }));
    });

    expect(persist).toHaveBeenCalledOnce();
    expect(result.current.store.settings.storeName).toBe("Updated Store");
  });

  it("reverts a failed store write and reports the persistence failure", async () => {
    const initialState = defaultState();
    const persist = vi.fn(async (state: typeof initialState) => state);
    persist.mockRejectedValue(new Error("D1 unavailable"));
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(StoreProvider, { initialState, persist }, children);
    const { result } = renderHook(() => ({ store: useStore(), update: useStoreActions() }), {
      wrapper,
    });

    await act(async () => {
      await expect(
        result.current.update((state) => ({
          ...state,
          settings: { ...state.settings, storeName: "Not persisted" },
        })),
      ).rejects.toThrow("D1 unavailable");
    });

    expect(result.current.store.settings.storeName).toBe(initialState.settings.storeName);
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
