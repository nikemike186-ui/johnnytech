import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BatteryCharging,
  Cable,
  Headphones,
  MapPin,
  Menu,
  Package,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useStore,
  type Product,
  type Phone,
  isSmartphone,
  isDevice,
  conditionLabel,
  waLink,
  buyMessage,
  formatPhoneNumber,
} from "@/lib/store";

export function Navbar() {
  const { settings } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    ["/", "Home"],
    ["/shop", "Shop"],
    ["/trade-in", "Trade-In"],
    ["/admin", "Admin"],
  ] as const;
  return (
    <header className="glass-nav sticky top-0 z-50">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link
          to="/"
          aria-label={`${settings.storeName} home`}
          className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors">
            <Smartphone className="h-5 w-5" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="max-w-36 truncate text-sm font-semibold tracking-tight sm:max-w-none">
              {settings.storeName}
            </span>
            <span className="hidden items-center gap-1 text-[10px] text-muted-foreground sm:flex">
              <MapPin className="h-3 w-3" />
              Zimbabwe
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map(([to, l]) => (
            <Link
              key={to}
              to={to}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
              activeProps={{ className: "!bg-secondary !text-foreground font-medium" }}
              activeOptions={{ exact: to === "/" }}
            >
              {l}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/70 text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto rounded-b-2xl border-x-0 border-t border-border bg-background/95 p-5 pt-7 shadow-xl backdrop-blur-2xl md:hidden"
            >
              <SheetHeader className="mb-5 pr-10 text-left">
                <SheetTitle>Explore Johnny Tech</SheetTitle>
                <SheetDescription>Shop phones, accessories, and more.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                {links.map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center rounded-xl px-4 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "!bg-secondary !text-foreground" }}
                    activeOptions={{ exact: to === "/" }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Proudly serving Zimbabwe
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export function Footer() {
  const { settings } = useStore();
  return (
    <footer className="glass-nav mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium">6 Months Warranty</p>
          </div>
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm font-medium">Free CBD Delivery</p>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Shop C23 Eastgate Market, Cnr Robert Mugabe &amp; Wynne St, Harare
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. Phones & accessories.
          </p>
          <a
            href={waLink(settings.whatsapp, "Hello Johnny Tech!")}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            WhatsApp: {formatPhoneNumber(settings.whatsapp)}
          </a>
          <a
            href="https://wa.me/263785253220?text=Hi%20Mashy%20Ltd!%20I%20saw%20the%20Johnny%20Tech%20website%20and%20would%20like%20one%20for%20my%20business."
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Website by Mashy Ltd
          </a>
        </div>
      </div>
    </footer>
  );
}

export function PhoneMockup({
  hex,
  size = "md",
  model = "iPhone 16",
  colorName,
}: {
  hex: string;
  size?: "md" | "lg";
  model?: string;
  colorName?: string | undefined;
}) {
  const generation = Number(/\biPhone\s+(\d+)\b/i.exec(model)?.[1] ?? 16);
  const isPro14 = generation === 14 && /\bpro\b/i.test(model);
  const frame =
    generation === 11
      ? "classic-notch"
      : generation === 12 || generation === 13 || (generation === 14 && !isPro14)
        ? "flat-notch"
        : isPro14
          ? "pro-island"
          : generation === 17 || generation === 18
            ? "flagship"
            : "dynamic-island";
  const dims = size === "lg" ? "h-80 w-40" : "h-44 w-[5.5rem]";
  const rounding =
    frame === "classic-notch"
      ? "rounded-[2rem]"
      : frame === "flat-notch"
        ? "rounded-[14px]"
        : frame === "flagship"
          ? "rounded-[18px]"
          : "rounded-[16px]";
  const bezel =
    frame === "flagship" ? "p-[2px]" : frame === "dynamic-island" ? "p-[3px]" : "p-[4px]";
  const screenRounding =
    frame === "classic-notch"
      ? "rounded-[1.6rem]"
      : frame === "flat-notch"
        ? "rounded-[11px]"
        : frame === "flagship"
          ? "rounded-[15px]"
          : "rounded-[13px]";
  const metalFrame =
    frame === "classic-notch"
      ? `linear-gradient(135deg, #d8dce2 0%, ${hex} 28%, #303640 70%, #bac1ca 100%)`
      : frame === "flat-notch"
        ? `linear-gradient(135deg, #e1e5eb 0%, ${hex} 26%, #252b34 72%, #aeb6c1 100%)`
        : `linear-gradient(135deg, #e0e4ea 0%, ${hex} 24%, #252b35 70%, #aab3bf 100%)`;
  const wallpaper =
    frame === "classic-notch"
      ? "radial-gradient(ellipse at 70% 18%, rgba(86, 124, 191, .45), transparent 38%), linear-gradient(145deg, #18253b, #26354e 52%, #101726)"
      : `radial-gradient(ellipse at 72% 20%, ${hex} 0%, transparent 42%), radial-gradient(ellipse at 22% 78%, rgba(103, 105, 229, .48), transparent 46%), linear-gradient(145deg, #101b31, #1d2841 54%, #101624)`;
  return (
    <div
      data-iphone-frame={frame}
      data-finish={colorName}
      role="img"
      aria-label={`${model} hardware mockup${colorName ? ` in ${colorName}` : ""}`}
      className={`relative ${dims} ${rounding} ${bezel} shadow-phone`}
      style={{ background: metalFrame }}
    >
      <div
        className={`relative h-full w-full overflow-hidden ring-1 ring-white/10 ${screenRounding}`}
        style={{ background: wallpaper }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.12),transparent_52%)]" />
        {frame === "classic-notch" || frame === "flat-notch" ? (
          <div
            data-testid={frame === "classic-notch" ? "iphone-wide-notch" : "iphone-notch"}
            className={`absolute left-1/2 top-0 -translate-x-1/2 rounded-b-[10px] bg-[#05070a] ${
              frame === "classic-notch" ? "h-3 w-[40%]" : "h-[9px] w-[30%]"
            }`}
          >
            <span className="absolute left-1/2 top-[2px] h-[2px] w-5 -translate-x-1/2 rounded-full bg-[#242831]" />
            <span className="absolute right-1.5 top-[3px] h-[3px] w-[3px] rounded-full bg-[#111722]" />
          </div>
        ) : (
          <div
            data-testid={frame === "flagship" ? "iphone-refined-island" : "iphone-dynamic-island"}
            className={`absolute left-1/2 top-[4px] -translate-x-1/2 rounded-full bg-island shadow-[0_1px_3px_rgba(0,0,0,0.55)] ${
              frame === "flagship" ? "h-[9px] w-[31%]" : "h-3 w-[36%]"
            }`}
          />
        )}
      </div>
    </div>
  );
}

function IPadMockup({ model }: { model: string }) {
  return (
    <div className="my-6 flex h-44 items-center justify-center">
      <div
        data-ipad-frame
        role="img"
        aria-label={`${model} tablet hardware mockup`}
        className="aspect-[4/3] w-36 rounded-[14px] p-[2px] shadow-phone"
        style={{
          background: "linear-gradient(135deg, #d6dbe2, #69717c 38%, #22262d 70%, #aeb5bf)",
        }}
      >
        <div className="relative h-full w-full rounded-[12px] bg-[#111318] p-[4px]">
          <div
            className="relative h-full w-full overflow-hidden rounded-[9px]"
            style={{
              background:
                "radial-gradient(ellipse at 72% 24%, rgba(108, 151, 255, .9), transparent 38%), radial-gradient(ellipse at 28% 78%, rgba(180, 95, 235, .72), transparent 44%), linear-gradient(135deg, #10275c 0%, #243b7d 48%, #111a3d 100%)",
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.2),transparent_58%)]" />
            <div
              data-testid="ipad-dock"
              className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1 rounded-[7px] border border-white/15 bg-white/15 p-1 backdrop-blur-sm"
            >
              <span className="h-3 w-3 rounded-[4px] bg-sky-300/80" />
              <span className="h-3 w-3 rounded-[4px] bg-emerald-300/80" />
              <span className="h-3 w-3 rounded-[4px] bg-violet-300/80" />
              <span className="h-3 w-3 rounded-[4px] bg-amber-200/80" />
            </div>
          </div>
          <div
            data-testid="ipad-camera"
            className="absolute left-1/2 top-[1px] h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#030405] ring-1 ring-white/25"
          />
        </div>
      </div>
    </div>
  );
}

export function SamsungMockup({ model }: { model: string }) {
  const name = model.toLowerCase();
  const fold = name.includes("z fold");
  const flip = name.includes("z flip");
  const ultra = /\bs\d+\s+ultra\b/.test(name);
  const notch = /\ba(?:07|17)\b/.test(name);
  const frame = fold ? "fold" : flip ? "flip" : ultra ? "ultra" : "galaxy";
  const dimensions = fold
    ? "h-28 w-36 rounded-[10px]"
    : flip
      ? "h-44 w-[4.75rem] rounded-[16px]"
      : ultra
        ? "h-44 w-[5.5rem] rounded-[6px]"
        : "h-44 w-[5.5rem] rounded-[16px]";
  const screenBackground = ultra
    ? "linear-gradient(145deg, #c0c7d0 0%, #7a8491 24%, #303846 60%, #111722 100%)"
    : "radial-gradient(ellipse at 68% 28%, rgba(119, 111, 255, .9), transparent 38%), radial-gradient(ellipse at 28% 80%, rgba(38, 231, 183, .8), transparent 44%), linear-gradient(140deg, #15376f 0%, #322078 52%, #0c2348 100%)";
  return (
    <div className="my-6 flex h-44 items-center justify-center">
      <div
        data-samsung-frame={frame}
        role="img"
        aria-label={`${model} hardware mockup`}
        className={`relative ${dimensions} ${ultra ? "p-[2px]" : "p-[3px]"} shadow-phone`}
        style={{
          background: ultra
            ? "linear-gradient(135deg, #e0e3e8, #626b78 34%, #171c24 70%, #a9b0ba)"
            : "linear-gradient(135deg, #d9e1eb, #45546b 35%, #151d2b 68%, #9aacc2)",
        }}
      >
        <div
          className={`relative h-full w-full overflow-hidden ring-1 ring-white/10 ${fold ? "rounded-[7px]" : ultra ? "rounded-[4px]" : "rounded-[13px]"}`}
          style={{ background: screenBackground }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.16),transparent_48%)]" />
          {fold && (
            <div
              data-testid="fold-crease"
              className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/25 shadow-[1px_0_4px_rgba(0,0,0,0.55)]"
            />
          )}
          {flip && (
            <div
              data-testid="flip-hinge"
              className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/30 shadow-[0_1px_4px_rgba(0,0,0,0.55)]"
            />
          )}
          {notch ? (
            <div
              data-testid="samsung-notch"
              className="absolute left-1/2 top-0 h-2 w-7 -translate-x-1/2 rounded-b-[10px] bg-[#080b12]"
            />
          ) : (
            <div
              data-testid="samsung-punch-hole"
              className="absolute left-1/2 top-[5px] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#05070a] shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ p: first, variants }: { p: Product; variants?: Phone[] }) {
  const { settings } = useStore();
  const [sel, setSel] = useState(first.id);
  const opts = first.category === "iphone" && variants?.length ? variants : [first];
  const p = opts.find((v) => v.id === sel) ?? first;
  const phone = isSmartphone(p);
  const device = isDevice(p);
  const ipad = p.category === "ipad" || /\bipad\b/i.test(p.model);
  return (
    <div className={`bento-card flex flex-col p-6 ${p.inStock ? "card-lift" : "opacity-60"}`}>
      <div className="flex justify-between">
        {device ? (
          <span className={p.condition === "new" ? "badge-new" : "badge-cpo"}>
            {conditionLabel(p.condition)}
          </span>
        ) : (
          <span className="badge-glass">{p.accessoryType}</span>
        )}
        {!p.inStock && <span className="badge-sold">Sold Out</span>}
      </div>
      {ipad ? (
        <IPadMockup model={p.model} />
      ) : p.category === "samsung" ? (
        <SamsungMockup model={p.model} />
      ) : phone ? (
        <div className="my-6 flex justify-center">
          <PhoneMockup
            hex={p.category === "iphone" ? (p.colorHex ?? "#252a32") : "#252a32"}
            model={p.model}
            colorName={p.category === "iphone" ? p.colorName : undefined}
          />
        </div>
      ) : (
        <div className="my-6 flex h-44 items-center justify-center rounded-2xl bg-secondary/60 text-primary">
          <AccessoryIcon type={p.accessoryType} />
        </div>
      )}
      {p.category === "iphone" && p.colorName && p.colorHex && (
        <div className="mb-3 flex items-center gap-2">
          {opts
            .filter(
              (v): v is Phone & { colorName: string; colorHex: string } =>
                v.category === "iphone" && Boolean(v.colorName && v.colorHex),
            )
            .map((v) => (
              <button
                key={v.id}
                aria-label={v.colorName}
                title={v.colorName}
                onClick={() => setSel(v.id)}
                className={`h-4 w-4 rounded-full ring-offset-2 ring-offset-background transition ${v.id === p.id ? "ring-2 ring-primary" : "ring-1 ring-border"}`}
                style={{ background: v.colorHex }}
              />
            ))}
          <span className="text-xs text-muted-foreground">{p.colorName}</span>
        </div>
      )}
      <h3 className="text-lg font-semibold tracking-tight">{p.model}</h3>
      <div className="mt-1 flex flex-wrap gap-2 text-xs">
        {phone ? (
          <>
            {p.storage && <span className="chip">{p.storage}</span>}
            {p.category === "iphone" ? (
              <span className="chip">{p.battery}% Battery Health</span>
            ) : (
              <span className="chip">Samsung</span>
            )}
          </>
        ) : p.category === "ipad" ? (
          <>
            <span className="chip">{p.storage}</span>
            <span className="chip">{p.connectivity}</span>
          </>
        ) : (
          <>
            <span className="chip">{p.compatibleWith}</span>
            <p className="mt-2 w-full text-sm text-muted-foreground">{p.description}</p>
          </>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-xl font-semibold text-primary">${p.price.toLocaleString()}</span>
        {p.inStock ? (
          <a
            href={waLink(settings.whatsapp, buyMessage(p))}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-apple text-sm"
          >
            Buy on WhatsApp
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">Unavailable</span>
        )}
      </div>
    </div>
  );
}

function AccessoryIcon({ type }: { type: string }) {
  const name = type.toLowerCase();
  const Icon = name.includes("power")
    ? BatteryCharging
    : name.includes("charger")
      ? Cable
      : name.includes("screen")
        ? ShieldCheck
        : name.includes("audio")
          ? Headphones
          : Package;
  return <Icon aria-hidden="true" className="h-16 w-16 stroke-[1.25]" />;
}
