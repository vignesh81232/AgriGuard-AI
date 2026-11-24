import type { Diagnosis } from "./diagnose";

const DATABASE_NAME = "agriguard-local-accounts";
const DATABASE_VERSION = 1;
const SESSION_KEY = "agriguard:local-user";
const PASSWORD_ITERATIONS = 310_000;

interface StoredAccount {
  username: string;
  salt: string;
  passwordHash: string;
  createdAt: number;
}

export interface DiagnosisHistoryEntry {
  id: string;
  username: string;
  createdAt: number;
  diagnosis: Diagnosis;
}

export type AccountErrorKind =
  | "username-invalid"
  | "password-short"
  | "password-mismatch"
  | "username-taken"
  | "invalid-credentials"
  | "storage-unavailable";

export class AccountError extends Error {
  readonly kind: AccountErrorKind;

  constructor(kind: AccountErrorKind) {
    super(kind);
    this.name = "AccountError";
    this.kind = kind;
  }
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new AccountError("storage-unavailable"));
  }

  const pendingDatabase = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("accounts")) {
        database.createObjectStore("accounts", { keyPath: "username" });
      }
      if (!database.objectStoreNames.contains("history")) {
        const history = database.createObjectStore("history", { keyPath: "id" });
        history.createIndex("username", "username", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new AccountError("storage-unavailable"));
    request.onblocked = () => reject(new AccountError("storage-unavailable"));
  }).catch((error: unknown) => {
    databasePromise = null;
    throw error instanceof AccountError ? error : new AccountError("storage-unavailable");
  });

  databasePromise = pendingDatabase;
  return pendingDatabase;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new AccountError("storage-unavailable"));
  });
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function encodeBytes(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new AccountError("storage-unavailable");
  const saltCopy = new Uint8Array(salt.byteLength);
  saltCopy.set(salt);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const result = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltCopy, iterations: PASSWORD_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return encodeBytes(new Uint8Array(result));
}

function decodeHex(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}

function randomSalt(): Uint8Array {
  if (!globalThis.crypto?.getRandomValues) throw new AccountError("storage-unavailable");
  return crypto.getRandomValues(new Uint8Array(16));
}

export async function registerLocalAccount(
  usernameInput: string,
  password: string,
  confirmPassword: string,
): Promise<string> {
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(usernameInput.trim())) {
    throw new AccountError("username-invalid");
  }
  if (password.length < 8) throw new AccountError("password-short");
  if (password !== confirmPassword) throw new AccountError("password-mismatch");

  const username = normalizeUsername(usernameInput);
  const salt = randomSalt();
  const account: StoredAccount = {
    username,
    salt: encodeBytes(salt),
    passwordHash: await hashPassword(password, salt),
    createdAt: Date.now(),
  };

  const database = await openDatabase();
  try {
    await requestResult(database.transaction("accounts", "readwrite").objectStore("accounts").add(account));
  } catch (error) {
    if (error instanceof DOMException && error.name === "ConstraintError") {
      throw new AccountError("username-taken");
    }
    throw error instanceof AccountError ? error : new AccountError("storage-unavailable");
  }

  setSession(username);
  return username;
}

function setSession(username: string): void {
  try {
    localStorage.setItem(SESSION_KEY, username);
  } catch {
    throw new AccountError("storage-unavailable");
  }
}

export async function signInLocalAccount(usernameInput: string, password: string): Promise<string> {
  const username = normalizeUsername(usernameInput);
  const database = await openDatabase();
  const account = await requestResult(
    database.transaction("accounts", "readonly").objectStore("accounts").get(username),
  ) as StoredAccount | undefined;

  if (!account) throw new AccountError("invalid-credentials");
  const actual = decodeHex(await hashPassword(password, decodeHex(account.salt)));
  if (!equalBytes(actual, decodeHex(account.passwordHash))) {
    throw new AccountError("invalid-credentials");
  }

  setSession(username);
  return username;
}

export async function getLocalSession(): Promise<string | null> {
  let username: string | null;
  try {
    username = localStorage.getItem(SESSION_KEY);
  } catch {
    throw new AccountError("storage-unavailable");
  }
  if (!username) return null;

  const database = await openDatabase();
  const account = await requestResult(
    database.transaction("accounts", "readonly").objectStore("accounts").get(username),
  ) as StoredAccount | undefined;
  if (account) return username;
  signOutLocalAccount();
  return null;
}

export function signOutLocalAccount(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    throw new AccountError("storage-unavailable");
  }
}

export async function saveDiagnosisForAccount(
  username: string,
  diagnosis: Diagnosis,
): Promise<DiagnosisHistoryEntry> {
  const entry: DiagnosisHistoryEntry = {
    id: crypto.randomUUID(),
    username,
    createdAt: diagnosis.createdAt,
    diagnosis,
  };
  const database = await openDatabase();
  try {
    await requestResult(database.transaction("history", "readwrite").objectStore("history").add(entry));
  } catch {
    throw new AccountError("storage-unavailable");
  }
  return entry;
}

export async function loadDiagnosisHistory(username: string): Promise<DiagnosisHistoryEntry[]> {
  const database = await openDatabase();
  const entries = await requestResult(
    database.transaction("history", "readonly").objectStore("history").index("username").getAll(username),
  );
  return (entries as DiagnosisHistoryEntry[]).sort((a, b) => b.createdAt - a.createdAt);
}
