import { describe, expect, it } from "vitest";
import { base64url, newId, newSecret, sha256 } from "../src/lib/crypto";

describe("crypto helpers", () => {
  it("base64url has no padding or URL-unsafe characters", () => {
    expect(base64url(new Uint8Array([251, 255, 191]))).toBe("-_-_");
    expect(base64url(new Uint8Array([1]))).toBe("AQ");
  });

  it("sha256 matches the standard test vector", async () => {
    // SHA-256("abc") = ba7816bf..., base64url-encoded
    expect(await sha256("abc")).toBe("ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0");
  });

  it("secrets are 43 characters (32 bytes) and never repeat", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const s = newSecret();
      expect(s).toMatch(/^[A-Za-z0-9_-]{43}$/);
      seen.add(s);
    }
    expect(seen.size).toBe(200);
  });

  it("ids carry their prefix", () => {
    expect(newId("sh")).toMatch(/^sh_[A-Za-z0-9_-]{12}$/);
  });
});
