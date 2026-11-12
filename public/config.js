// Public Supabase settings (safe to expose: every table is protected by Row Level Security).
// The GitHub Pages workflow overwrites this file if SUPABASE_URL / SUPABASE_ANON_KEY repo variables are set.
window.APP_CONFIG = {
  supabaseUrl: "https://yfswjxzsrgngxbuajnov.supabase.co",
  supabaseAnonKey: "sb_publishable_6Qz3wewB80JK22KeC40Z_w_3SSoUk2p",
  // Shared dashboard account; people sign in with its password only.
  loginEmail: "team@years-plan.local",
  // Staff account: sees the plan, SOPs and KPI but not the real finance figures.
  staffEmail: "staff@years-plan.local",
};
