// Serves the static dashboard and injects Supabase settings from Worker vars at /config.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/config.js") {
      const cfg = {
        supabaseUrl: env.SUPABASE_URL || "",
        supabaseAnonKey: env.SUPABASE_ANON_KEY || "",
      };
      return new Response(`window.APP_CONFIG = ${JSON.stringify(cfg)};`, {
        headers: {
          "content-type": "application/javascript; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
