import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
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

    expect(screen.getByText("JOHNNY TECH • STAFF PORTAL")).toBeInTheDocument();
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

  it("keeps the existing PIN authentication check", async () => {
    await renderAdmin();
    fireEvent.change(screen.getByLabelText("PIN"), { target: { value: "1234" } });
    fireEvent.submit(document.querySelector("form")!);
    expect(await screen.findByRole("heading", { name: "Dashboard." })).toBeInTheDocument();
  });
});
