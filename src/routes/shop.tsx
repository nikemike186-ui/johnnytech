import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { isDevice, useStore, type Product } from "@/lib/store";
import { ProductCard } from "@/components/Shell";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop iPhones, iPads, Samsung & Accessories — Johnny Tech" },
      {
        name: "description",
        content:
          "Shop iPhones, iPads, Samsung phones, MagSafe power packs, chargers, screen guards and audio accessories.",
      },
      { property: "og:title", content: "Shop iPhones, iPads, Samsung & Accessories — Johnny Tech" },
      {
        property: "og:description",
        content: "Browse iPhones, iPads, Samsung phones and accessories.",
      },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { inventory } = useStore();
  const [category, setCategory] = useState<"all" | "iphone" | "ipad" | "samsung" | "accessory">(
    "all",
  );
  const [condition, setCondition] = useState<"all" | "new" | "preowned">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");
  const list = useMemo(() => {
    let products = inventory.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (condition !== "all" && (!isDevice(product) || product.condition !== condition))
        return false;
      const details = isDevice(product)
        ? `${product.model} ${product.storage ?? ""} ${product.category === "iphone" ? (product.colorName ?? "") : product.category === "ipad" ? product.connectivity : ""} ${product.condition}`
        : `${product.model} ${product.accessoryType} ${product.description} ${product.compatibleWith}`;
      return details.toLowerCase().includes(q.trim().toLowerCase());
    });
    if (sort === "asc") products = [...products].sort((a, b) => a.price - b.price);
    if (sort === "desc") products = [...products].sort((a, b) => b.price - a.price);
    const groups = new Map<string, Product[]>();
    products.forEach((product) => {
      const key =
        product.category === "iphone"
          ? `${product.category}|${product.model}|${product.storage}|${product.condition}|${product.price}|${product.battery}`
          : product.id;
      groups.set(key, [...(groups.get(key) ?? []), product]);
    });
    return [...groups.values()];
  }, [inventory, category, condition, q, sort]);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-12">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Shop.</h1>
      <div className="mt-8 space-y-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">
          {(
            [
              ["all", "Everything"],
              ["iphone", "iPhones"],
              ["ipad", "iPads"],
              ["samsung", "Samsung"],
              ["accessory", "Accessories"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setCategory(value);
                if (value === "accessory") setCondition("all");
              }}
              className={`pill shrink-0 ${category === value ? "pill-active" : ""}`}
            >
              {label}
            </button>
          ))}
          {category !== "accessory" && (
            <>
              <span className="mx-1 hidden h-8 w-px self-center bg-border sm:block" />
              {(
                [
                  ["all", "Any condition"],
                  ["new", "Brand New"],
                  ["preowned", "Pre-Owned"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setCondition(value)}
                  className={`pill shrink-0 ${condition === value ? "pill-active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="field flex min-w-0 flex-1 items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              aria-label="Search products"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products"
              className="w-full min-w-0 bg-transparent outline-none"
            />
          </label>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="field w-full sm:w-auto"
          >
            <option value="none">Sort by</option>
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((group) => (
          <ProductCard
            key={group[0]!.id}
            p={group[0]!}
            {...(group[0]!.category === "iphone"
              ? { variants: group.filter((product) => product.category === "iphone") }
              : {})}
          />
        ))}
      </div>
      {list.length === 0 && (
        <p className="py-20 text-center text-muted-foreground">No products match your filters.</p>
      )}
    </main>
  );
}
