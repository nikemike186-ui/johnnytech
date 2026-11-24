import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Footer, ProductCard } from "@/components/Shell";
import { defaultState } from "@/lib/store";

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

const inventory = defaultState().inventory;
const product = (id: string) => inventory.find((item) => item.id === id)!;

describe("store footer", () => {
  it("shows the Mashy Ltd credit link at the footer", () => {
    render(<Footer />);
    const creditLink = screen.getByRole("link", { name: "Website by Mashy Ltd" });
    expect(creditLink).toHaveAttribute(
      "href",
      "https://wa.me/263785253220?text=Hi%20Mashy%20Ltd!%20I%20saw%20the%20Johnny%20Tech%20website%20and%20would%20like%20one%20for%20my%20business.",
    );
    expect(creditLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: /WhatsApp:/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });
});

describe("product hardware mockups", () => {
  it("uses safe new-tab attributes for product ordering links", () => {
    render(<ProductCard p={product("iphone-16-pro-max-256")} />);
    expect(screen.getByRole("link", { name: "Buy on WhatsApp" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("uses generation-specific iPhone frames and refined flagship islands", () => {
    const cases = [
      ["iphone-11-pro-max-256", "classic-notch", "iphone-wide-notch"],
      ["iphone-12-128", "flat-notch", "iphone-notch"],
      ["iphone-13-128", "flat-notch", "iphone-notch"],
      ["iphone-14-plus-128", "flat-notch", "iphone-notch"],
      ["iphone-14-pro-128", "pro-island", "iphone-dynamic-island"],
      ["iphone-15-128", "dynamic-island", "iphone-dynamic-island"],
      ["iphone-16-pro-max-256", "dynamic-island", "iphone-dynamic-island"],
      ["iphone-17-pro-max-256", "flagship", "iphone-refined-island"],
      ["iphone-18-pro-max-256-blue", "flagship", "iphone-refined-island"],
      ["iphone-18-pro-max-256-burgundy", "flagship", "iphone-refined-island"],
    ] as const;

    for (const [id, frame, detail] of cases) {
      const { container, unmount } = render(<ProductCard p={product(id)} />);
      const mockup = container.querySelector(`[data-iphone-frame="${frame}"]`);
      expect(mockup).toBeInTheDocument();
      if (frame === "classic-notch") expect(mockup).toHaveClass("rounded-[2rem]");
      if (frame === "flat-notch") expect(mockup).toHaveClass("rounded-[14px]");
      if (frame === "flagship") expect(mockup).toHaveClass("p-[2px]");
      expect(container.querySelector(`[data-testid="${detail}"]`)).toBeInTheDocument();
      unmount();
    }

    const blueFlagship = render(<ProductCard p={product("iphone-18-pro-max-256-blue")} />);
    expect(blueFlagship.container.querySelector('[data-finish="Blue"]')).toBeInTheDocument();
    const burgundyFlagship = render(<ProductCard p={product("iphone-18-pro-max-256-burgundy")} />);
    expect(
      burgundyFlagship.container.querySelector('[data-finish="Burgundy"]'),
    ).toBeInTheDocument();
  });

  it("uses a square punch-hole frame for Galaxy S Ultra models", () => {
    const { container } = render(<ProductCard p={product("samsung-s22-ultra-128")} />);
    expect(container.querySelector('[data-samsung-frame="ultra"]')).toHaveClass("rounded-[6px]");
    expect(container.querySelector('[data-testid="samsung-punch-hole"]')).toBeInTheDocument();
    expect(container.querySelector(".bg-island")).not.toBeInTheDocument();
  });

  it("uses a rounded Galaxy frame and an A07 notch", () => {
    const { container } = render(<ProductCard p={product("samsung-a07-4-64")} />);
    expect(container.querySelector('[data-samsung-frame="galaxy"]')).toHaveClass("rounded-[16px]");
    expect(container.querySelector('[data-testid="samsung-notch"]')).toBeInTheDocument();
  });

  it("shows a wide Fold crease and a Flip hinge", () => {
    const fold = render(<ProductCard p={product("samsung-z-fold-4-256")} />);
    expect(fold.container.querySelector('[data-samsung-frame="fold"]')).toHaveClass("w-36", "h-28");
    expect(fold.container.querySelector('[data-testid="fold-crease"]')).toBeInTheDocument();

    const flip = render(<ProductCard p={product("samsung-z-flip-4")} />);
    expect(flip.container.querySelector('[data-samsung-frame="flip"]')).toHaveClass(
      "h-44",
      "w-[4.75rem]",
    );
    expect(flip.container.querySelector('[data-testid="flip-hinge"]')).toBeInTheDocument();
  });

  it("keeps the iPhone Dynamic Island and renders a landscape iPad mockup", () => {
    const iphone = render(<ProductCard p={product("iphone-16-pro-max-256")} />);
    expect(iphone.container.querySelector(".bg-island")).toBeInTheDocument();
    expect(iphone.container.querySelector("[data-samsung-frame]")).not.toBeInTheDocument();

    const ipad = render(<ProductCard p={product("ipad-11th-128-wifi")} />);
    expect(ipad.container.querySelector("[data-ipad-frame]")).toHaveClass(
      "aspect-[4/3]",
      "rounded-[14px]",
    );
    expect(ipad.container.querySelector('[data-testid="ipad-camera"]')).toBeInTheDocument();
    expect(ipad.container.querySelector('[data-testid="ipad-dock"]')).toBeInTheDocument();
    expect(ipad.container.querySelector(".bg-island")).not.toBeInTheDocument();
    expect(ipad.container.querySelector("[data-samsung-frame]")).not.toBeInTheDocument();

    const ipadNamedAccessory = render(
      <ProductCard p={{ ...product("9"), id: "ipad-case-test", model: "iPad Case" }} />,
    );
    expect(ipadNamedAccessory.container.querySelector("[data-ipad-frame]")).toBeInTheDocument();
  });
});
