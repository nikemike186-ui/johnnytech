import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, BatteryFull, RefreshCw, PackageCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { PhoneMockup, ProductCard } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Johnny Tech | Authentic iPhones, Samsung & iPads in Harare" },
      {
        name: "description",
        content:
          "Shop authentic iPhones, Samsung phones, and iPads in Harare. Enjoy a 6-month warranty, free CBD delivery, and convenient WhatsApp ordering with Johnny Tech.",
      },
      {
        property: "og:title",
        content: "Johnny Tech | Authentic iPhones, Samsung & iPads in Harare",
      },
      {
        property: "og:description",
        content:
          "Shop authentic iPhones, Samsung phones, and iPads in Harare. Enjoy a 6-month warranty, free CBD delivery, and convenient WhatsApp ordering with Johnny Tech.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { settings, inventory } = useStore();
  const featured = inventory.filter((p) => p.featured && p.inStock);
  const featuredPhones = featured.filter((product) => product.category === "iphone");
  const hero = featuredPhones[0] ?? inventory.find((product) => product.category === "iphone");
  const trust = [
    [
      PackageCheck,
      "100% Original Parts",
      "Every device inspected. Zero aftermarket components.",
      "sm:col-span-2",
    ],
    [BatteryFull, "Verified Battery Health %", "Tested and shown on every listing.", ""],
    [
      RefreshCw,
      "Instant Trade-In & Top-Up",
      "Swap your old iPhone today. Pay only the difference.",
      "",
    ],
    [
      ShieldCheck,
      "Factory Sealed Warranty",
      "Brand-new units ship sealed with full Apple warranty.",
      "sm:col-span-2",
    ],
  ] as const;
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="flex flex-col items-center pt-14 text-center sm:pt-20">
        <span className="badge-glass mb-6">● Certified by Johnny Tech</span>
        <div className="dynamic-island">
          <span className="pulse-dot" />
          {inventory.filter((p) => p.inStock).length} products in stock · Trade-ins open
        </div>
        <h1 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          {settings.tagline}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Sealed or certified. Every battery tested. Every price transparent.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/shop" className="btn-apple">
            Browse Products
          </Link>
          <Link to="/trade-in" className="btn-ghost">
            Trade-In Swap
          </Link>
        </div>
        {hero && (
          <div className="mt-14 flex items-end gap-6">
            {featuredPhones.slice(1, 2).map((p) => (
              <div key={p.id} className="hidden translate-y-6 sm:block">
                <PhoneMockup
                  hex={p.colorHex ?? "#252a32"}
                  model={p.model}
                  colorName={p.colorName}
                />
              </div>
            ))}
            <PhoneMockup
              hex={hero.colorHex ?? "#252a32"}
              model={hero.model}
              colorName={hero.colorName}
              size="lg"
            />
            {featuredPhones.slice(2, 3).map((p) => (
              <div key={p.id} className="hidden translate-y-6 sm:block">
                <PhoneMockup
                  hex={p.colorHex ?? "#252a32"}
                  model={p.model}
                  colorName={p.colorName}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-24">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-semibold tracking-tight">Featured Deals.</h2>
          <Link to="/shop" className="text-sm text-primary hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Why Johnny Tech.</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {trust.map(([Icon, t, d, span]) => (
            <div key={t} className={`bento-card p-8 ${span}`}>
              <Icon className="h-8 w-8 text-primary" />
              <h3 className="mt-5 text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
