import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useStore,
  estimateTradeInCredit,
  tradeInConditions,
  conditionLabel,
  waLink,
  type Phone,
  type SamsungPhone,
  type TradeInCondition,
  type Product,
} from "@/lib/store";
import { PhoneMockup, SamsungMockup } from "@/components/Shell";

type TradeInDevice = Phone | SamsungPhone;

const tradeConditionOptions: { value: TradeInCondition; label: string }[] = [
  { value: "mint", label: tradeInConditions.mint.label },
  { value: "good", label: tradeInConditions.good.label },
  { value: "fair", label: tradeInConditions.fair.label },
  { value: "cracked", label: tradeInConditions.cracked.label },
];

const isTradeInDevice = (product: Product): product is TradeInDevice =>
  product.category === "iphone" || product.category === "samsung";

const modelKey = (product: TradeInDevice) => `${product.category}:${product.model}`;

function deviceDescription(device: TradeInDevice) {
  return [
    device.model,
    device.storage ?? "Storage not specified",
    device.category === "iphone" ? device.colorName : null,
    conditionLabel(device.condition),
  ]
    .filter(Boolean)
    .join(" · ");
}

function catalogOptionLabel(device: TradeInDevice) {
  return `${device.storage ?? "Storage not specified"}${device.category === "iphone" && device.colorName ? ` · ${device.colorName}` : ""} · ${conditionLabel(device.condition)} · $${device.price.toLocaleString()}`;
}

export const Route = createFileRoute("/trade-in")({
  head: () => ({
    meta: [
      { title: "Trade-In & Upgrade Estimator — Johnny Tech" },
      {
        name: "description",
        content:
          "Estimate your iPhone or Samsung Galaxy trade-in value from Johnny Tech catalog prices.",
      },
      { property: "og:title", content: "Trade-In & Upgrade Estimator — Johnny Tech" },
      {
        property: "og:description",
        content: "Get an online iPhone or Samsung Galaxy trade-in estimate.",
      },
    ],
  }),
  component: TradeIn,
});

export function TradeIn() {
  const { inventory, settings } = useStore();
  const currentDevices = inventory.filter(isTradeInDevice);
  const targetDevices = currentDevices.filter(
    (product) => product.inStock && product.condition === "new",
  );
  const iphoneModels = Array.from(
    new Set(currentDevices.filter((product) => product.category === "iphone").map((p) => p.model)),
  );
  const samsungModels = Array.from(
    new Set(currentDevices.filter((product) => product.category === "samsung").map((p) => p.model)),
  );
  const initialCurrent = currentDevices[0];
  const [currentSelection, setCurrentSelection] = useState(
    initialCurrent ? modelKey(initialCurrent) : "",
  );
  const [currentDeviceId, setCurrentDeviceId] = useState(initialCurrent?.id ?? "");
  const [condition, setCondition] = useState<TradeInCondition>("good");
  const [targetId, setTargetId] = useState(targetDevices[0]?.id ?? "");

  const currentVariants = currentDevices.filter((device) => modelKey(device) === currentSelection);
  const currentDevice =
    currentVariants.find((device) => device.id === currentDeviceId) ?? currentVariants[0];
  const target = targetDevices.find((device) => device.id === targetId) ?? targetDevices[0];
  const credit = currentDevice ? estimateTradeInCredit(currentDevice.price, condition) : 0;
  const topUp = target ? Math.max(0, target.price - credit) : 0;
  const message =
    currentDevice && target
      ? `Hi Johnny Tech! I'd like to lock in my trade-in estimate.\n\nCurrent device: ${deviceDescription(currentDevice)}\nCondition: ${tradeInConditions[condition].label}\nCurrent catalog retail price: $${currentDevice.price.toLocaleString()}\nEstimated trade-in credit: $${credit.toLocaleString()}\n\nTarget upgrade: ${deviceDescription(target)}\nNew phone retail price: $${target.price.toLocaleString()}\nEstimated top-up balance: $${topUp.toLocaleString()}\n\nI understand this is an online estimate only and the final trade-in value and top-up are subject to a physical inspection at Shop C23 Eastgate Market, Corner Robert Mugabe & Wynne Street, Harare.`
      : "";

  return (
    <main className="mx-auto max-w-6xl px-4 pt-12">
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Trade in. Trade up.</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Get an estimate based on current Johnny Tech catalog prices.
        </p>
      </header>

      <div className="bento-card mt-10 grid gap-8 p-6 sm:p-8 md:grid-cols-5">
        <section className="space-y-7 text-left md:col-span-3">
          <div>
            <label htmlFor="current-device" className="mb-2 block text-sm font-medium">
              Current Device
            </label>
            <select
              id="current-device"
              value={currentSelection}
              onChange={(event) => {
                const selection = event.target.value;
                const firstVariant = currentDevices.find(
                  (device) => modelKey(device) === selection,
                );
                setCurrentSelection(selection);
                setCurrentDeviceId(firstVariant?.id ?? "");
              }}
              className="field w-full"
              disabled={currentDevices.length === 0}
            >
              {iphoneModels.length > 0 && (
                <optgroup label="iPhones">
                  {iphoneModels.map((model) => (
                    <option key={model} value={`iphone:${model}`}>
                      {model}
                    </option>
                  ))}
                </optgroup>
              )}
              {samsungModels.length > 0 && (
                <optgroup label="Samsung Galaxy">
                  {samsungModels.map((model) => (
                    <option key={model} value={`samsung:${model}`}>
                      {model}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="current-storage" className="mb-2 block text-sm font-medium">
              Storage
            </label>
            <select
              id="current-storage"
              value={currentDevice?.id ?? ""}
              onChange={(event) => setCurrentDeviceId(event.target.value)}
              className="field w-full"
              disabled={currentVariants.length === 0}
            >
              {currentVariants.map((device) => (
                <option key={device.id} value={device.id}>
                  {catalogOptionLabel(device)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="trade-condition" className="mb-2 block text-sm font-medium">
              Current Device Condition
            </label>
            <select
              id="trade-condition"
              value={condition}
              onChange={(event) => setCondition(event.target.value as TradeInCondition)}
              className="field w-full"
            >
              {tradeConditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="target-device" className="mb-2 block text-sm font-medium">
              Target Phone They Want to Upgrade To
            </label>
            <select
              id="target-device"
              value={target?.id ?? ""}
              onChange={(event) => setTargetId(event.target.value)}
              className="field w-full"
              disabled={targetDevices.length === 0}
            >
              {targetDevices.filter((device) => device.category === "iphone").length > 0 && (
                <optgroup label="iPhones">
                  {targetDevices
                    .filter((device) => device.category === "iphone")
                    .map((device) => (
                      <option key={device.id} value={device.id}>
                        {deviceDescription(device)} · ${device.price.toLocaleString()}
                      </option>
                    ))}
                </optgroup>
              )}
              {targetDevices.filter((device) => device.category === "samsung").length > 0 && (
                <optgroup label="Samsung Galaxy">
                  {targetDevices
                    .filter((device) => device.category === "samsung")
                    .map((device) => (
                      <option key={device.id} value={device.id}>
                        {deviceDescription(device)} · ${device.price.toLocaleString()}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>
        </section>

        <aside className="glass-summary flex flex-col text-center md:col-span-2">
          {target &&
            (target.category === "iphone" ? (
              <PhoneMockup
                hex={target.colorHex ?? "#252a32"}
                model={target.model}
                colorName={target.colorName}
              />
            ) : (
              <SamsungMockup model={target.model} />
            ))}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Estimated Trade-In Value</p>
              <p className="text-4xl font-semibold text-primary">
                {currentDevice ? `$${credit.toLocaleString()}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Phone Retail Price</p>
              <p className="text-2xl font-semibold">
                {target ? `$${target.price.toLocaleString()}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Top-Up Balance</p>
              <p className="text-4xl font-semibold tracking-tight">
                {target && currentDevice ? `$${topUp.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>

          <div
            role="note"
            className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left"
          >
            <p className="text-sm font-semibold">In-store inspection required</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Note: This figure is an online estimate only. Final trade-in value and top-up deal are
              confirmed after a quick physical inspection at our shop (Shop C23 Eastgate Market,
              Corner Robert Mugabe &amp; Wynne Street, Harare). Visit us in-store or chat with us on
              WhatsApp for full details on your upgrade deal.
            </p>
          </div>

          {target && currentDevice ? (
            <a
              href={waLink(settings.whatsapp, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-apple mt-5 w-full"
            >
              Lock In Estimate on WhatsApp
            </a>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              Add an available iPhone or Samsung device to the catalog to get an estimate.
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}
