import { deleteCookie, getCookie, getRequestUrl, setCookie } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { defaultState, restoreState, type StoreState } from "./store";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PIN_ITERATIONS = 120_000;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBuffer(hex: string): ArrayBuffer {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return buffer;
}

function randomHex(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: hexToBuffer(salt),
      iterations: PIN_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function matchesHash(actual: string, expected: string): boolean {
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) {
    difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function sessionCookieName(): string {
  return getRequestUrl().protocol === "https:" ? "__Host-johnny-tech-admin" : "johnny-tech-admin";
}

function setSessionCookie(token: string): void {
  const secure = getRequestUrl().protocol === "https:";
  setCookie(sessionCookieName(), token, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

async function initializeStore(): Promise<void> {
  const initialized = await env.DB.prepare(
    "SELECT value FROM store_meta WHERE key = 'initialized'",
  ).first<{ value: string }>();
  if (initialized) return;

  const initial = defaultState();
  await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)").bind(
      "storeName",
      initial.settings.storeName,
    ),
    env.DB.prepare("INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)").bind(
      "tagline",
      initial.settings.tagline,
    ),
    env.DB.prepare("INSERT OR IGNORE INTO store_settings (key, value) VALUES (?, ?)").bind(
      "whatsapp",
      initial.settings.whatsapp,
    ),
    ...initial.inventory.map((product) =>
      env.DB.prepare("INSERT OR IGNORE INTO store_products (id, data) VALUES (?, ?)").bind(
        product.id,
        JSON.stringify(product),
      ),
    ),
    env.DB.prepare("INSERT OR IGNORE INTO store_meta (key, value) VALUES ('initialized', '1')"),
  ]);
}

export async function readStore(): Promise<StoreState> {
  await initializeStore();
  const [settings, products] = await Promise.all([
    env.DB.prepare("SELECT key, value FROM store_settings").all<{
      key: string;
      value: string;
    }>(),
    env.DB.prepare("SELECT data FROM store_products ORDER BY rowid ASC").all<{
      data: string;
    }>(),
  ]);
  const state = restoreState({
    settings: Object.fromEntries(settings.results.map(({ key, value }) => [key, value])),
    inventory: products.results.map(({ data }) => JSON.parse(data) as unknown),
  });
  if (!state) throw new Error("Johnny Tech store data in D1 has an invalid shape.");
  return state;
}

export async function persistStoreData(data: StoreState): Promise<StoreState> {
  await requireAdmin();
  const statements = [
    env.DB.prepare("DELETE FROM store_products"),
    ...Object.entries(data.settings).map(([key, value]) =>
      env.DB.prepare(
        "INSERT INTO store_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      ).bind(key, value),
    ),
    ...data.inventory.map((product) =>
      env.DB.prepare("INSERT INTO store_products (id, data) VALUES (?, ?)").bind(
        product.id,
        JSON.stringify(product),
      ),
    ),
  ];
  await env.DB.batch(statements);
  return readStore();
}

async function requireAdmin(): Promise<string> {
  const token = getCookie(sessionCookieName());
  if (!token) throw new Error("Admin authentication is required.");
  const tokenHash = await sha256(token);
  const session = await env.DB.prepare(
    "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?",
  )
    .bind(tokenHash, Date.now())
    .first<{ token_hash: string }>();
  if (!session) throw new Error("Admin session is invalid or expired.");
  return tokenHash;
}

export async function hasAdminSession(): Promise<boolean> {
  const token = getCookie(sessionCookieName());
  if (!token) return false;
  const tokenHash = await sha256(token);
  const session = await env.DB.prepare(
    "SELECT token_hash FROM admin_sessions WHERE token_hash = ? AND expires_at > ?",
  )
    .bind(tokenHash, Date.now())
    .first<{ token_hash: string }>();
  return session !== null;
}

async function ensureAdminCredential(): Promise<{ salt: string; hash: string }> {
  const credential = await env.DB.prepare(
    "SELECT salt, hash FROM admin_credentials WHERE key = 'pin'",
  ).first<{ salt: string; hash: string }>();
  if (credential) return credential;

  const initialPin = env.ADMIN_PIN;
  if (!initialPin || !/^\d{4,8}$/.test(initialPin)) {
    throw new Error(
      "Set the ADMIN_PIN Wrangler secret to a 4–8 digit PIN before the first admin login.",
    );
  }
  const salt = randomHex(16);
  const hash = await hashPin(initialPin, salt);
  await env.DB.prepare(
    "INSERT OR IGNORE INTO admin_credentials (key, salt, hash) VALUES ('pin', ?, ?)",
  )
    .bind(salt, hash)
    .run();

  const initialized = await env.DB.prepare(
    "SELECT salt, hash FROM admin_credentials WHERE key = 'pin'",
  ).first<{ salt: string; hash: string }>();
  if (!initialized) throw new Error("Unable to initialize the admin credential in D1.");
  return initialized;
}

export async function verifyAdminPin(pin: string): Promise<{ success: boolean }> {
  await initializeStore();
  const credential = await ensureAdminCredential();
  const providedHash = await hashPin(pin, credential.salt);
  if (!matchesHash(providedHash, credential.hash)) return { success: false };

  const token = randomHex(32);
  await env.DB.prepare("INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)")
    .bind(await sha256(token), Date.now() + SESSION_TTL_SECONDS * 1000)
    .run();
  setSessionCookie(token);
  return { success: true };
}

export async function endAdminSession(): Promise<void> {
  const token = getCookie(sessionCookieName());
  if (token) {
    await env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash = ?")
      .bind(await sha256(token))
      .run();
  }
  deleteCookie(sessionCookieName(), {
    httpOnly: true,
    secure: getRequestUrl().protocol === "https:",
    sameSite: "strict",
    path: "/",
  });
}

export async function updateAdminPin(pin: string): Promise<void> {
  const currentSession = await requireAdmin();
  const salt = randomHex(16);
  const hash = await hashPin(pin, salt);
  await env.DB.batch([
    env.DB.prepare(
      "INSERT INTO admin_credentials (key, salt, hash) VALUES ('pin', ?, ?) ON CONFLICT(key) DO UPDATE SET salt = excluded.salt, hash = excluded.hash",
    ).bind(salt, hash),
    env.DB.prepare("DELETE FROM admin_sessions WHERE token_hash != ?").bind(currentSession),
  ]);
}
