// Purna Family Worker: /api/* here, everything else is static assets from ./dist
// (security headers for pages come from public/_headers).

import { handleApi, type Env } from "./api";
import { cleanup } from "./cleanup";

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) return handleApi(req, env);
    return env.ASSETS.fetch(req);
  },

  /** Daily retention clean-up (see src/cleanup.ts and [triggers] in wrangler.toml). */
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(cleanup(env).then((r) => console.log("purna-family cleanup", JSON.stringify(r))));
  },
} satisfies ExportedHandler<Env>;
