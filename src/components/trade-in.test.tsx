import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TradeIn } from "@/routes/trade-in";

describe("catalog-linked trade-in calculator", () => {
  it("calculates a Samsung credit from selected storage and builds an inspection-aware WhatsApp inquiry", () => {
    render(<TradeIn />);

    const currentDevice = screen.getByLabelText("Current Device");
    expect(currentDevice.querySelector('optgroup[label="iPhones"]')).toBeInTheDocument();
    expect(currentDevice.querySelector('optgroup[label="Samsung Galaxy"]')).toBeInTheDocument();

    fireEvent.change(currentDevice, { target: { value: "samsung:Samsung S22 Ultra" } });
    fireEvent.change(screen.getByLabelText("Storage"), {
      target: { value: "samsung-s22-ultra-256" },
    });
    fireEvent.change(screen.getByLabelText("Target Phone They Want to Upgrade To"), {
      target: { value: "samsung-s26-ultra-256" },
    });

    expect(screen.getByText("$245")).toBeInTheDocument();
    expect(screen.getByText("$1,100")).toBeInTheDocument();
    expect(screen.getByText("$855")).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent(
      "Note: This figure is an online estimate only. Final trade-in value and top-up deal are confirmed after a quick physical inspection at our shop (Shop C23 Eastgate Market, Corner Robert Mugabe & Wynne Street, Harare). Visit us in-store or chat with us on WhatsApp for full details on your upgrade deal.",
    );

    const inquiry = screen.getByRole("link", { name: "Lock In Estimate on WhatsApp" });
    expect(inquiry).toHaveAttribute("rel", "noopener noreferrer");
    const message = new URL(inquiry.getAttribute("href")!).searchParams.get("text")!;
    expect(message).toContain("Current device: Samsung S22 Ultra · 256GB · Brand New Sealed");
    expect(message).toContain("Condition: Good / Normal Wear (80–89% Battery)");
    expect(message).toContain("Estimated trade-in credit: $245");
    expect(message).toContain("Target upgrade: Samsung S26 Ultra · 256GB · Brand New Sealed");
    expect(message).toContain("Estimated top-up balance: $855");
    expect(message).toContain("subject to a physical inspection at Shop C23 Eastgate Market");
  });
});
