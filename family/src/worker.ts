// Purna Family Worker: /api/* here, everything else is static assets from ./public
// (security headers for pages come from public/_headers).

import { handleApi, type Env } from "./api";

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) return handleApi(req, env);
    return env.ASSETS.fetch(req);
  },
} satisfies ExportedHandler<Env>;
