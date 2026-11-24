import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, Lock, Trash2 } from "lucide-react";
import {
  useStore,
  useStoreActions,
  defaultState,
  type Accessory,
  type Condition,
  type Phone,
  type SamsungPhone,
  type Tablet,
  type Product,
} from "@/lib/store";
import { changeAdminPin, getAdminSession, loginAdmin, logoutAdmin } from "@/lib/store-api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Johnny Tech" },
      { name: "description", content: "Manage Johnny Tech store settings and device inventory." },
      { property: "og:title", content: "Admin — Johnny Tech" },
      { property: "og:description", content: "Store management dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [ok, setOk] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const checkSession = useServerFn(getAdminSession);
  const signIn = useServerFn(loginAdmin);
  const signOut = useServerFn(logoutAdmin);
  const updatePin = useServerFn(changeAdminPin);

  useEffect(() => {
    checkSession()
      .then(setOk)
      .catch((error: unknown) => {
        console.error("Unable to check admin session.", error);
        setAuthError("Unable to verify your session. Please refresh and try again.");
      })
      .finally(() => setCheckingSession(false));
  }, [checkSession]);

  const submitPin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    try {
      const result = await signIn({ data: { pin } });
      if (result.success) setOk(true);
      else {
        setErr(true);
        setPin("");
        setShakeKey((key) => key + 1);
      }
    } catch (error) {
      console.error("Unable to authenticate admin.", error);
      setAuthError("Unable to sign in. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setOk(false);
    } catch (error) {
      console.error("Unable to end admin session.", error);
      setAuthError("Unable to sign out. Please try again.");
    }
  };

  const handlePinChange = async (nextPin: string) => {
    await updatePin({ data: { pin: nextPin } });
  };

  if (checkingSession) return <main className="min-h-[70vh]" aria-label="Checking admin session" />;
  if (!ok)
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <form
          key={shakeKey}
          onSubmit={submitPin}
          className={`bento-card relative w-full max-w-sm overflow-hidden border border-white/10 p-8 text-center shadow-[0_0_54px_rgba(120,90,255,0.14)] backdrop-blur-2xl ${
            err ? "animate-pin-shake ring-1 ring-destructive/50" : ""
          }`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />
          <div className="relative">
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              JOHNNY TECH • STAFF PORTAL
            </p>
            <Lock className="mx-auto h-8 w-8 text-primary" />
            <h1 className="mt-4 text-2xl font-semibold">Admin Access</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your PIN</p>
            <div className="relative mt-6">
              <input
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErr(false);
                  setAuthError("");
                }}
                className={`field w-full pr-12 text-center text-2xl tracking-[0.5em] ${
                  err
                    ? "border-destructive ring-1 ring-destructive/30 focus:border-destructive"
                    : ""
                }`}
                maxLength={8}
                minLength={4}
                pattern="[0-9]{4,8}"
                required
                aria-label="PIN"
                aria-invalid={err}
                aria-describedby={err ? "pin-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPin((visible) => !visible)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                aria-pressed={showPin}
                className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {err && (
              <p id="pin-error" role="alert" className="mt-2 text-sm text-destructive">
                Incorrect PIN. Please try again.
              </p>
            )}
            {authError && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {authError}
              </p>
            )}
            <button className="btn-apple mt-5 w-full">Unlock</button>
            <Link
              to="/shop"
              className="mt-5 inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Back to Storefront
            </Link>
          </div>
        </form>
      </main>
    );
  return <Dashboard onSignOut={handleSignOut} onChangePin={handlePinChange} />;
}

type PhoneDraft = Omit<Phone, "id" | "category" | "inStock">;
type SamsungPhoneDraft = Omit<SamsungPhone, "id" | "category" | "inStock">;
type TabletDraft = Omit<Tablet, "id" | "category" | "inStock">;
type AccessoryDraft = Omit<Accessory, "id" | "category" | "inStock">;
const blankPhone: PhoneDraft = {
  model: "",
  storage: "128GB",
  condition: "new",
  battery: 100,
  colorName: "",
  colorHex: "#3C3C3D",
  price: 0,
  featured: false,
};
const blankSamsung: SamsungPhoneDraft = {
  model: "",
  condition: "new",
  price: 0,
  featured: false,
};
const blankTablet: TabletDraft = {
  model: "",
  storage: "128GB",
  connectivity: "Wi-Fi",
  condition: "new",
  price: 0,
  featured: false,
};
const blankAccessory: AccessoryDraft = {
  model: "",
  accessoryType: "Power",
  description: "",
  compatibleWith: "",
  price: 0,
  featured: false,
};

function Dashboard({
  onSignOut,
  onChangePin,
}: {
  onSignOut: () => Promise<void>;
  onChangePin: (pin: string) => Promise<void>;
}) {
  const { settings, inventory } = useStore();
  const setStore = useStoreActions();
  const [s, setS] = useState(settings);
  const [newPin, setNewPin] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [kind, setKind] = useState<Product["category"]>("iphone");
  const [phone, setPhone] = useState(blankPhone);
  const [samsung, setSamsung] = useState(blankSamsung);
  const [tablet, setTablet] = useState(blankTablet);
  const [accessory, setAccessory] = useState(blankAccessory);
  const updateStore = (
    update: (state: ReturnType<typeof useStore>) => ReturnType<typeof useStore>,
  ) => {
    setSaveError("");
    setSaveMessage("");
    void setStore(update).catch((error: unknown) => {
      console.error("Unable to save Johnny Tech store data.", error);
      setSaveError("Changes could not be saved. Check your connection and try again.");
    });
  };
  const upd = (id: string, patch: Partial<Pick<Product, "price" | "featured" | "inStock">>) =>
    updateStore((st) => ({
      ...st,
      inventory: st.inventory.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  const addProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = Date.now().toString();
    const product: Product =
      kind === "iphone"
        ? { ...phone, id, category: "iphone", inStock: true }
        : kind === "samsung"
          ? { ...samsung, id, category: "samsung", inStock: true }
          : kind === "ipad"
            ? { ...tablet, id, category: "ipad", inStock: true }
            : { ...accessory, id, category: "accessory", inStock: true };
    if (!product.model.trim()) return;
    updateStore((st) => ({ ...st, inventory: [product, ...st.inventory] }));
    setPhone(blankPhone);
    setSamsung(blankSamsung);
    setTablet(blankTablet);
    setAccessory(blankAccessory);
  };
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 pt-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-semibold tracking-tight">Dashboard.</h1>
        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={() => void onSignOut()} className="btn-ghost text-sm">
            Sign out
          </button>
          <button
            onClick={() => {
              if (confirm("Reset inventory to the default catalog?")) {
                const catalog = defaultState().inventory;
                updateStore((st) => ({ ...st, inventory: catalog }));
              }
            }}
            className="btn-ghost text-sm"
          >
            Reset to Default Catalog
          </button>
          <button
            onClick={() => {
              if (confirm("Reset all settings and inventory to defaults?")) {
                updateStore(() => defaultState());
              }
            }}
            className="btn-ghost text-sm"
          >
            Reset all defaults
          </button>
        </div>
      </div>

      <section className="bento-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Store Settings</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <L t="Store name">
            <input
              className="field w-full"
              value={s.storeName}
              onChange={(e) => setS({ ...s, storeName: e.target.value })}
            />
          </L>
          <L t="WhatsApp number (with country code)">
            <input
              className="field w-full"
              value={s.whatsapp}
              onChange={(e) => setS({ ...s, whatsapp: e.target.value })}
            />
          </L>
          <L t="Hero tagline" span>
            <input
              className="field w-full"
              value={s.tagline}
              onChange={(e) => setS({ ...s, tagline: e.target.value })}
            />
          </L>
        </div>
        <button
          onClick={() =>
            updateStore((st) => ({
              ...st,
              settings: { storeName: s.storeName, tagline: s.tagline, whatsapp: s.whatsapp },
            }))
          }
          className="btn-apple mt-5"
        >
          Save settings
        </button>
        <div className="mt-8 border-t border-border pt-6">
          <h3 className="font-semibold">Admin PIN</h3>
          <form
            className="mt-3 flex flex-col gap-3 sm:flex-row"
            onSubmit={async (event) => {
              event.preventDefault();
              setSaveError("");
              setSaveMessage("");
              try {
                await onChangePin(newPin);
                setNewPin("");
                setSaveMessage("Admin PIN updated.");
              } catch (error) {
                console.error("Unable to update admin PIN.", error);
                setSaveError("Admin PIN could not be updated. Please try again.");
              }
            }}
          >
            <input
              className="field w-full sm:max-w-xs"
              type="password"
              inputMode="numeric"
              minLength={4}
              maxLength={8}
              pattern="[0-9]{4,8}"
              aria-label="New admin PIN"
              placeholder="4–8 digits"
              value={newPin}
              onChange={(event) => setNewPin(event.target.value)}
              required
            />
            <button className="btn-apple">Update PIN</button>
          </form>
        </div>
      </section>

      {saveError && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive"
        >
          {saveError}
        </p>
      )}
      {saveMessage && (
        <p role="status" className="text-sm text-muted-foreground">
          {saveMessage}
        </p>
      )}

      <section className="bento-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Add Product</h2>
        <form onSubmit={addProduct} className="mt-5 grid gap-4 sm:grid-cols-4">
          <L t="Product type">
            <select
              className="field w-full"
              value={kind}
              onChange={(e) => setKind(e.target.value as Product["category"])}
            >
              <option value="iphone">iPhone</option>
              <option value="ipad">iPad</option>
              <option value="samsung">Samsung</option>
              <option value="accessory">Accessory</option>
            </select>
          </L>
          <L t={kind === "accessory" ? "Product name" : "Model"}>
            <input
              required
              className="field w-full"
              placeholder={
                kind === "iphone"
                  ? "iPhone 16 Pro"
                  : kind === "ipad"
                    ? "iPad 11th Gen"
                    : kind === "samsung"
                      ? "Samsung Galaxy S24"
                      : "MagSafe Power Pack"
              }
              value={
                kind === "iphone"
                  ? phone.model
                  : kind === "ipad"
                    ? tablet.model
                    : kind === "samsung"
                      ? samsung.model
                      : accessory.model
              }
              onChange={(e) => {
                if (kind === "iphone") setPhone({ ...phone, model: e.target.value });
                else if (kind === "ipad") setTablet({ ...tablet, model: e.target.value });
                else if (kind === "samsung") setSamsung({ ...samsung, model: e.target.value });
                else setAccessory({ ...accessory, model: e.target.value });
              }}
            />
          </L>
          {kind === "iphone" ? (
            <>
              <L t="Storage">
                <select
                  className="field w-full"
                  value={phone.storage}
                  onChange={(e) => setPhone({ ...phone, storage: e.target.value })}
                >
                  {["128GB", "256GB", "512GB", "1TB", "2TB"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </L>
              <L t="Condition">
                <select
                  className="field w-full"
                  value={phone.condition}
                  onChange={(e) =>
                    setPhone({
                      ...phone,
                      condition: e.target.value as Condition,
                      battery: e.target.value === "new" ? 100 : phone.battery,
                    })
                  }
                >
                  <option value="new">New</option>
                  <option value="preowned">Pre-Owned</option>
                </select>
              </L>
              <L t="Battery health %">
                <input
                  type="number"
                  min={50}
                  max={100}
                  className="field w-full"
                  value={phone.battery}
                  onChange={(e) => setPhone({ ...phone, battery: +e.target.value })}
                />
              </L>
              <L t="Color name">
                <input
                  className="field w-full"
                  value={phone.colorName}
                  onChange={(e) => setPhone({ ...phone, colorName: e.target.value })}
                />
              </L>
              <L t="Color hex">
                <input
                  type="color"
                  className="field h-10 w-full p-1"
                  value={phone.colorHex}
                  onChange={(e) => setPhone({ ...phone, colorHex: e.target.value })}
                />
              </L>
            </>
          ) : kind === "ipad" ? (
            <>
              <L t="Storage">
                <select
                  className="field w-full"
                  value={tablet.storage}
                  onChange={(e) => setTablet({ ...tablet, storage: e.target.value })}
                >
                  {["128GB", "256GB", "512GB", "1TB"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </L>
              <L t="Connectivity">
                <select
                  className="field w-full"
                  value={tablet.connectivity}
                  onChange={(e) =>
                    setTablet({ ...tablet, connectivity: e.target.value as Tablet["connectivity"] })
                  }
                >
                  <option>Wi-Fi</option>
                  <option>Wi-Fi + Cellular</option>
                </select>
              </L>
              <L t="Condition">
                <select
                  className="field w-full"
                  value={tablet.condition}
                  onChange={(e) => setTablet({ ...tablet, condition: e.target.value as Condition })}
                >
                  <option value="new">New</option>
                  <option value="preowned">Pre-Owned</option>
                </select>
              </L>
            </>
          ) : kind === "samsung" ? (
            <>
              <L t="Storage (optional)">
                <input
                  className="field w-full"
                  placeholder="128GB"
                  value={samsung.storage ?? ""}
                  onChange={(e) =>
                    setSamsung((current) => {
                      const next = { ...current };
                      if (e.target.value) next.storage = e.target.value;
                      else delete next.storage;
                      return next;
                    })
                  }
                />
              </L>
              <L t="Condition">
                <select
                  className="field w-full"
                  value={samsung.condition}
                  onChange={(e) =>
                    setSamsung({ ...samsung, condition: e.target.value as Condition })
                  }
                >
                  <option value="new">New</option>
                  <option value="preowned">Pre-Owned</option>
                </select>
              </L>
            </>
          ) : (
            <>
              <L t="Accessory category">
                <select
                  className="field w-full"
                  value={accessory.accessoryType}
                  onChange={(e) => setAccessory({ ...accessory, accessoryType: e.target.value })}
                >
                  {["Power", "Charger", "Screen Protection", "Audio", "Case", "Cable", "Other"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </L>
              <L t="Compatible with">
                <input
                  className="field w-full"
                  placeholder="iPhone 12 and newer"
                  value={accessory.compatibleWith}
                  onChange={(e) => setAccessory({ ...accessory, compatibleWith: e.target.value })}
                />
              </L>
              <L t="Description" span>
                <input
                  className="field w-full"
                  value={accessory.description}
                  onChange={(e) => setAccessory({ ...accessory, description: e.target.value })}
                />
              </L>
            </>
          )}
          <L t="Price (USD)">
            <input
              type="number"
              min={0}
              className="field w-full"
              value={
                kind === "iphone"
                  ? phone.price
                  : kind === "ipad"
                    ? tablet.price
                    : kind === "samsung"
                      ? samsung.price
                      : accessory.price
              }
              onChange={(e) => {
                const price = +e.target.value;
                if (kind === "iphone") setPhone({ ...phone, price });
                else if (kind === "ipad") setTablet({ ...tablet, price });
                else if (kind === "samsung") setSamsung({ ...samsung, price });
                else setAccessory({ ...accessory, price });
              }}
            />
          </L>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={
                kind === "iphone"
                  ? phone.featured
                  : kind === "ipad"
                    ? tablet.featured
                    : kind === "samsung"
                      ? samsung.featured
                      : accessory.featured
              }
              onChange={(e) => {
                const featured = e.target.checked;
                if (kind === "iphone") setPhone({ ...phone, featured });
                else if (kind === "ipad") setTablet({ ...tablet, featured });
                else if (kind === "samsung") setSamsung({ ...samsung, featured });
                else setAccessory({ ...accessory, featured });
              }}
            />{" "}
            Featured
          </label>
          <button className="btn-apple sm:col-span-4">Add to inventory</button>
        </form>
      </section>

      <section className="bento-card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Inventory ({inventory.length})</h2>
        <div className="mt-5 divide-y divide-border">
          {inventory.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
              {p.category === "iphone" && p.colorHex && (
                <span
                  className="h-5 w-5 rounded-full ring-1 ring-border"
                  style={{ background: p.colorHex }}
                />
              )}
              <div className="min-w-40 flex-1">
                <p className="font-medium">
                  {p.model}
                  {(p.category === "iphone" || p.category === "samsung" || p.category === "ipad") &&
                  p.storage
                    ? ` · ${p.storage}`
                    : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.category === "iphone"
                    ? `${p.colorName ? `${p.colorName} · ` : ""}${p.condition === "new" ? "New" : "Pre-Owned"} · ${p.battery}%`
                    : p.category === "samsung"
                      ? `${p.condition === "new" ? "New" : "Pre-Owned"} · Samsung`
                      : p.category === "ipad"
                        ? `${p.connectivity} · ${p.condition === "new" ? "New" : "Pre-Owned"}`
                        : `${p.accessoryType} · ${p.compatibleWith}`}
                </p>
              </div>
              <label className="flex items-center gap-1">
                $
                <input
                  type="number"
                  className="field w-24 py-1"
                  min={0}
                  key={`${p.id}:${p.price}`}
                  defaultValue={p.price}
                  onBlur={(e) => {
                    if (e.currentTarget.value === "") return;
                    const price = Number(e.currentTarget.value);
                    if (Number.isFinite(price) && price >= 0 && price !== p.price) {
                      upd(p.id, { price });
                    }
                  }}
                  aria-label="Price"
                />
              </label>
              <button
                onClick={() => upd(p.id, { featured: !p.featured })}
                className={p.featured ? "pill pill-active" : "pill"}
              >
                ★ Featured
              </button>
              <button
                onClick={() => upd(p.id, { inStock: !p.inStock })}
                className={p.inStock ? "badge-new" : "badge-sold"}
              >
                {p.inStock ? "In Stock" : "Sold Out"}
              </button>
              <button
                aria-label="Delete"
                onClick={() =>
                  updateStore((st) => ({
                    ...st,
                    inventory: st.inventory.filter((x) => x.id !== p.id),
                  }))
                }
                className="rounded-full p-2 text-destructive hover:bg-secondary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function L({ t, children, span }: { t: string; children: React.ReactNode; span?: boolean }) {
  return (
    <label className={`block text-sm ${span ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-muted-foreground">{t}</span>
      {children}
    </label>
  );
}
