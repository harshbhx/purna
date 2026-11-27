// Random keys, ids and pairing codes. Only SHA-256 hashes of keys/tokens are stored.

export const PAIR_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

/** 32 random bytes, base64url (43 chars). Used for family keys and doctor share tokens. */
export function newSecret(): string {
  return base64url(randomBytes(32));
}

export function newId(prefix: string): string {
  return prefix + "_" + base64url(randomBytes(9));
}

export async function sha256(text: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return base64url(new Uint8Array(d));
}

/** DIYA-XXXX from an unambiguous alphabet (no 0/O, 1/I/L). Rejection sampling keeps it uniform. */
export function newPairCode(): string {
  let out = "";
  while (out.length < 4) {
    const [b] = randomBytes(1);
    if (b < 248) out += PAIR_ALPHABET[b % 31];
  }
  return "DIYA-" + out;
}

/** Accepts "diya-7k3p", "7K3P", "DIYA 7K3P"; returns the canonical form or null. */
export function normalizePairCode(input: string): string | null {
  const s = input.toUpperCase().replace(/[\s-]/g, "").replace(/^DIYA/, "");
  if (s.length !== 4) return null;
  for (const c of s) if (!PAIR_ALPHABET.includes(c)) return null;
  return "DIYA-" + s;
}
