import type { D1Migration } from "cloudflare:test";
import type { Env } from "../src/api";

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      ASSETS: Fetcher;
      PAIR_LIMIT: import("../src/lib/limits").RateLimiter;
      SESSION_LIMIT: import("../src/lib/limits").RateLimiter;
      NOTE_LIMIT: import("../src/lib/limits").RateLimiter;
      TEST_MIGRATIONS: D1Migration[];
    }
  }
}
export type { Env };

declare global {
  namespace Cloudflare {
    interface GlobalProps {
      mainModule: typeof import("../src/worker");
    }
  }
}
