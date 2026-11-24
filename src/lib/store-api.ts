import { createServerFn } from "@tanstack/react-start";
import { restoreState } from "./store";

export const loadStore = createServerFn({ method: "GET" }).handler(async () => {
  const { readStore } = await import("./store-db.server");
  return readStore();
});

export const persistStore = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const state = restoreState(data);
    if (!state) throw new Error("Invalid store data.");
    return state;
  })
  .handler(async ({ data }) => {
    const { persistStoreData } = await import("./store-db.server");
    return persistStoreData(data);
  });

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { hasAdminSession } = await import("./store-db.server");
  return hasAdminSession();
});

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("pin" in data)) {
      throw new Error("Enter a valid PIN.");
    }
    if (typeof data.pin !== "string" || !/^\d{4,8}$/.test(data.pin)) {
      throw new Error("PIN must contain 4–8 digits.");
    }
    return { pin: data.pin };
  })
  .handler(async ({ data }) => {
    const { verifyAdminPin } = await import("./store-db.server");
    try {
      return await verifyAdminPin(data.pin);
    } catch (error) {
      console.error("Admin sign-in could not complete.", error);
      throw error;
    }
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const { endAdminSession } = await import("./store-db.server");
  await endAdminSession();
  return { success: true };
});

export const changeAdminPin = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (typeof data !== "object" || data === null || !("pin" in data)) {
      throw new Error("Enter a valid PIN.");
    }
    if (typeof data.pin !== "string" || !/^\d{4,8}$/.test(data.pin)) {
      throw new Error("PIN must contain 4–8 digits.");
    }
    return { pin: data.pin };
  })
  .handler(async ({ data }) => {
    const { updateAdminPin } = await import("./store-db.server");
    await updateAdminPin(data.pin);
    return { success: true };
  });
