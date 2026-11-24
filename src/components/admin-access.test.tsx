import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";

const serverFns = vi.hoisted(() => ({
  loadStore: vi.fn(),
  persistStore: vi.fn(),
  getAdminSession: vi.fn(),
  loginAdmin: vi.fn(),
  logoutAdmin: vi.fn(),
  changeAdminPin: vi.fn(),
}));

vi.mock("@/lib/store-api", () => serverFns);
vi.mock("@tanstack/react-start", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-start")>();
  return { ...actual, useServerFn: (serverFn: unknown) => serverFn };
});

beforeEach(() => {
  vi.clearAllMocks();
  serverFns.loadStore.mockResolvedValue({
    settings: {
      storeName: "Johnny Tech",
      tagline: "Your Next Phone. New or Certified Pre-Owned.",
      whatsapp: "263712279955",
    },
    inventory: [],
  });
  serverFns.persistStore.mockResolvedValue(undefined);
  serverFns.getAdminSession.mockResolvedValue(false);
  serverFns.loginAdmin.mockImplementation(async ({ data }: { data: { pin: string } }) => ({
    success: data.pin === "1234",
  }));
  serverFns.logoutAdmin.mockResolvedValue({ success: true });
  serverFns.changeAdminPin.mockResolvedValue({ success: true });
});

async function renderAdmin() {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: ["/admin"] }),
  });
  await router.load();
  return render(<RouterProvider router={router} />);
}

describe("admin access", () => {
  it("supports show/hide, shakes and clears on failure, and links back to the shop", async () => {
    await renderAdmin();

    expect(await screen.findByText("JOHNNY TECH • STAFF PORTAL")).toBeInTheDocument();
    const input = screen.getByLabelText("PIN");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByRole("button", { name: "Show PIN" }));
    expect(screen.getByLabelText("PIN")).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Hide PIN" }));
    expect(screen.getByLabelText("PIN")).toHaveAttribute("type", "password");

    fireEvent.change(screen.getByLabelText("PIN"), { target: { value: "0000" } });
    fireEvent.submit(document.querySelector("form")!);
    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect PIN. Please try again.");
    expect(screen.getByLabelText("PIN")).toHaveValue("");
    expect(document.querySelector("form")).toHaveClass("animate-pin-shake", "ring-destructive/50");
    expect(screen.getByRole("link", { name: "← Back to Storefront" })).toHaveAttribute(
      "href",
      "/shop",
    );
  });

  it("authenticates against the server and opens the dashboard", async () => {
    await renderAdmin();
    fireEvent.change(await screen.findByLabelText("PIN"), { target: { value: "1234" } });
    fireEvent.submit(document.querySelector("form")!);
    expect(await screen.findByRole("heading", { name: "Dashboard." })).toBeInTheDocument();
    expect(serverFns.loginAdmin).toHaveBeenCalledWith({ data: { pin: "1234" } });
  });
});
