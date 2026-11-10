// Replaces the claude.ai artifact storage used by the dashboard with Supabase,
// and gates the page behind the shared team password.
(function () {
  const cfg = window.APP_CONFIG || {};
  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  window.__sb = sb;
  let resolveAuth;
  const authReady = new Promise((r) => (resolveAuth = r));

  document.documentElement.classList.add("locked");
  const css = document.createElement("style");
  css.textContent = `
    html.locked header, html.locked main { display: none !important; }
    #gate { position: fixed; inset: 0; z-index: 50; display: none; align-items: center; justify-content: center; padding: 16px;
      background: radial-gradient(ellipse at 25% -20%, #3A7A63 0%, #24584A 45%, #173D31 100%); }
    html.locked #gate { display: flex; }
    #gate form { width: 100%; max-width: 380px; background: linear-gradient(#FFFDF7, #F7F1E3); border: 1px solid #D8CBAE;
      border-radius: 10px; padding: 26px 24px; box-shadow: 0 20px 50px rgba(0,0,0,.45); font-family: "IBM Plex Sans Thai Looped", "Sarabun", sans-serif; color: #2B2416; }
    #gate h1 { margin: 0 0 4px; font-family: "Trirong", Georgia, serif; font-size: 20px; color: #20392F; }
    #gate p { margin: 0 0 16px; color: #6E6350; font-size: 14px; }
    #gate input { width: 100%; font: inherit; padding: 10px 12px; border: 1px solid #C9BA97; border-radius: 7px; margin-bottom: 12px; box-sizing: border-box; }
    #gate button { width: 100%; font: inherit; font-weight: 700; padding: 10px; border-radius: 7px; cursor: pointer; color: #F6EBCB;
      border: 1px solid #163A2F; background: linear-gradient(#2F6B57, #1F4D3E); }
    #gate .err { color: #A4161A; min-height: 1.3em; margin: 10px 0 0; font-size: 14px; }
    #logout { font: inherit; font-size: 12px; cursor: pointer; color: #F3EBD6; background: none; border: 1px solid rgba(243,235,214,.5); border-radius: 99px; padding: 3px 10px; white-space: nowrap; flex: 0 0 auto; }
    @media (max-width: 640px) { #logout { font-size: 11px; padding: 2px 8px; } #logout .lg-long { display: none; } }`;
  document.head.appendChild(css);

  function buildGate() {
    const g = document.createElement("div");
    g.id = "gate";
    g.innerHTML = `<form id="gateForm" autocomplete="on">
      <h1>CMNH แผนงานปี 2570</h1><p>กรอกรหัสเข้าใช้งาน</p>
      <input type="password" id="gatePw" placeholder="รหัสเข้าใช้งาน" autocomplete="current-password" required>
      <button type="submit">เข้าสู่ระบบ</button><p class="err" id="gateErr"></p></form>`;
    document.body.appendChild(g);
    g.querySelector("#gateForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const err = g.querySelector("#gateErr");
      err.textContent = "กำลังเข้าสู่ระบบ…";
      const { error } = await sb.auth.signInWithPassword({ email: cfg.loginEmail, password: g.querySelector("#gatePw").value });
      err.textContent = error ? "รหัสไม่ถูกต้อง" : "";
    });
    const hr = document.querySelector(".hright");
    if (hr) {
      const b = document.createElement("button");
      b.id = "logout"; b.title = "ออกจากระบบ"; b.innerHTML = 'ออก<span class="lg-long">จากระบบ</span>';
      b.onclick = async () => { await sb.auth.signOut(); location.reload(); };
      hr.appendChild(b);
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildGate); else buildGate();

  sb.auth.onAuthStateChange((_ev, session) => {
    if (session) { document.documentElement.classList.remove("locked"); resolveAuth(); }
    else document.documentElement.classList.add("locked");
  });

  // Minimal stand-in for the artifact db API the dashboard uses: db.doc('shared/<key>').set / .onSnapshot
  const db = {
    doc(path) {
      const key = path.replace(/^shared\//, "");
      return {
        async set(obj) {
          const { error } = await sb.from("shared_state").upsert({ key, v: obj.v, at: obj.at });
          if (error) throw { code: error.code === "42501" ? "invalid_argument" : "unknown", message: error.message };
        },
        onSnapshot(cb, onErr) {
          const emit = (row) => cb({
            exists: !!row,
            data: () => (row ? { v: row.v, at: row.at } : undefined),
            metadata: { fromCache: false, hasPendingWrites: false },
          });
          const load = () => sb.from("shared_state").select("v,at").eq("key", key).maybeSingle()
            .then(({ data, error }) => (error ? onErr && onErr(error) : emit(data)));
          load();
          sb.channel("shared-" + key)
            .on("postgres_changes", { event: "*", schema: "public", table: "shared_state", filter: "key=eq." + key }, (p) => emit(p.new))
            .subscribe();
          document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
        },
      };
    },
  };

  window.claude = { use: async (name) => (name === "db" ? (await authReady, db) : null) };
})();
