import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const $ = (s) => document.querySelector(s);
const cfg = window.APP_CONFIG || {};
const STATUSES = ["ยังไม่เริ่ม", "กำลังทำ", "เสร็จแล้ว", "ล่าช้า", "ยกเลิก"];
const STATUS_COLORS = { "ยังไม่เริ่ม": "#cbd5e1", "กำลังทำ": "#2563eb", "เสร็จแล้ว": "#16a34a", "ล่าช้า": "#dc2626", "ยกเลิก": "#94a3b8" };
const DECISION_STATUSES = ["รอตัดสินใจ", "อนุมัติแล้ว", "ไม่อนุมัติ", "เลื่อน"];
const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const show = (el, on) => { el.hidden = !on; };
const msg = (text, error = false) => { const m = $("#app-msg"); m.textContent = text; m.classList.toggle("error", error); };

if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
  show($("#config-error"), true);
  throw new Error("Supabase config missing");
}

const sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
const state = { tasks: [], projects: [], kpis: [], actuals: [], decisions: [], metrics: [] };

// ---------- auth ----------
$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("#login-email").value.trim();
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin, shouldCreateUser: true } });
  $("#login-msg").textContent = error ? `ผิดพลาด: ${error.message}` : "ส่งลิงก์แล้ว กรุณาเปิดอีเมล";
});
$("#logout").addEventListener("click", () => sb.auth.signOut());

sb.auth.onAuthStateChange((_event, session) => render(session));

async function render(session) {
  const signedIn = !!session;
  show($("#login-view"), !signedIn);
  show($("#app-view"), signedIn);
  show($("#user-box"), signedIn);
  if (!signedIn) return;
  $("#user-email").textContent = session.user.email;
  await loadAll();
}

// ---------- data ----------
async function loadAll() {
  msg("กำลังโหลด…");
  const q = (t, order = "sort_order") => sb.from(t).select("*").order(order);
  const [tasks, projects, kpis, actuals, decisions, metrics] = await Promise.all([
    q("tasks"), q("projects"), q("kpis"), sb.from("kpi_actuals").select("*"), q("decisions"), q("metrics"),
  ]);
  const err = [tasks, projects, kpis, actuals, decisions, metrics].find((r) => r.error);
  if (err) return msg(`โหลดข้อมูลไม่สำเร็จ: ${err.error.message}`, true);
  Object.assign(state, {
    tasks: tasks.data, projects: projects.data, kpis: kpis.data,
    actuals: actuals.data, decisions: decisions.data, metrics: metrics.data,
  });
  if (!tasks.data.length && !metrics.data.length) {
    msg("ไม่พบข้อมูล — อีเมลนี้อาจยังไม่อยู่ในรายชื่อผู้มีสิทธิ์ (allowed_users)", true);
  } else msg("");
  drawOverview(); drawTasks(); drawProjects(); drawKpis(); drawDecisions();
}

async function save(table, match, patch) {
  const { error } = await sb.from(table).update(patch).match(match);
  msg(error ? `บันทึกไม่สำเร็จ: ${error.message}` : "บันทึกแล้ว", !!error);
  return !error;
}

// ---------- tabs ----------
document.querySelectorAll(".tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((x) => x.classList.toggle("active", x === b));
    document.querySelectorAll(".tab").forEach((t) => show(t, t.id === `tab-${b.dataset.tab}`));
  })
);

// ---------- overview ----------
function drawOverview() {
  const total = state.tasks.length;
  const counts = Object.fromEntries(STATUSES.map((s) => [s, state.tasks.filter((t) => t.status === s).length]));
  const done = counts["เสร็จแล้ว"];
  const pct = total ? Math.round((done / total) * 100) : 0;
  const pending = state.decisions.filter((d) => d.status === "รอตัดสินใจ").length;
  $("#progress").innerHTML = `
    <div class="progress-row">
      <strong>งานเสร็จ ${done}/${total} (${pct}%)</strong>
      <div class="bar">${STATUSES.map((s) => `<span title="${s}: ${counts[s]}" style="width:${total ? (counts[s] / total) * 100 : 0}%;background:${STATUS_COLORS[s]}"></span>`).join("")}</div>
      <span>เรื่องรอ CEO ตัดสินใจ <strong>${pending}</strong> เรื่อง</span>
    </div>
    <div class="legend">${STATUSES.map((s) => `<span><i style="background:${STATUS_COLORS[s]}"></i>${s} ${counts[s]}</span>`).join("")}</div>`;
  $("#metrics").innerHTML = state.metrics.map((m) => `
    <div class="card metric">
      <div class="label">${esc(m.label)}</div>
      <div class="value">${esc(m.value)}</div>
      <div class="detail">${esc(m.detail)}</div>
    </div>`).join("");
}

// ---------- tasks ----------
const quarterSel = $("#filter-quarter"), statusSel = $("#filter-status");
STATUSES.forEach((s) => statusSel.insertAdjacentHTML("beforeend", `<option>${s}</option>`));
quarterSel.addEventListener("change", drawTasks);
statusSel.addEventListener("change", drawTasks);

function statusSelect(value, options, attrs) {
  return `<select ${attrs}>${options.map((o) => `<option ${o === value ? "selected" : ""}>${o}</option>`).join("")}</select>`;
}

function drawTasks() {
  const quarters = [...new Set(state.tasks.map((t) => t.quarter))];
  if (quarterSel.options.length === 1) quarters.forEach((q) => quarterSel.insertAdjacentHTML("beforeend", `<option>${esc(q)}</option>`));
  const rows = state.tasks.filter((t) => (!quarterSel.value || t.quarter === quarterSel.value) && (!statusSel.value || t.status === statusSel.value));
  $("#tasks-table").innerHTML = `
    <thead><tr><th>ไตรมาส</th><th>งาน</th><th>สายรับผิดชอบ</th><th>ผลลัพธ์ที่ต้องได้</th><th>ส่งภายใน</th><th>สถานะ</th><th>หมายเหตุ</th></tr></thead>
    <tbody>${rows.map((t) => `
      <tr class="${t.is_extra ? "extra" : ""}">
        <td><span class="pill">${esc(t.quarter)}</span></td>
        <td>${esc(t.title)}</td>
        <td class="small">${esc(t.owner)}</td>
        <td class="small">${esc(t.outcome)}</td>
        <td class="small">${esc(t.due_text)}</td>
        <td>${statusSelect(t.status, STATUSES, `data-task="${t.id}"`)}</td>
        <td contenteditable="true" data-task-note="${t.id}">${esc(t.note)}</td>
      </tr>`).join("")}</tbody>`;
}
$("#tasks-table").addEventListener("change", async (e) => {
  const id = e.target.dataset.task; if (!id) return;
  if (await save("tasks", { id }, { status: e.target.value })) {
    state.tasks.find((t) => t.id == id).status = e.target.value; drawOverview();
  }
});
$("#tasks-table").addEventListener("focusout", (e) => {
  const id = e.target.dataset.taskNote; if (!id) return;
  const note = e.target.innerText.trim(); const t = state.tasks.find((x) => x.id == id);
  if ((t.note ?? "") !== note) save("tasks", { id }, { note }).then((ok) => ok && (t.note = note));
});

// ---------- projects ----------
function drawProjects() {
  $("#projects-table").innerHTML = `
    <thead><tr><th>#</th><th>โปรเจ็ค</th><th>ทำอะไร</th><th>เริ่ม</th><th>ผู้รับผิดชอบ</th><th>KPI ปี 2570 (แก้ได้)</th><th>เรื่องที่ต้องตัดสิน</th><th>สถานะ</th></tr></thead>
    <tbody>${state.projects.map((p) => `
      <tr>
        <td>${p.sort_order}</td><td><strong>${esc(p.name)}</strong></td>
        <td class="small">${esc(p.description)}</td><td class="small">${esc(p.started)}</td>
        <td>${esc(p.owner)}</td>
        <td contenteditable="true" data-project-kpi="${p.id}">${esc(p.kpi_2570)}</td>
        <td class="small">${esc(p.decision)}</td>
        <td>${statusSelect(p.status, STATUSES, `data-project="${p.id}"`)}</td>
      </tr>`).join("")}</tbody>`;
}
$("#projects-table").addEventListener("change", (e) => {
  const id = e.target.dataset.project; if (id) save("projects", { id }, { status: e.target.value });
});
$("#projects-table").addEventListener("focusout", (e) => {
  const id = e.target.dataset.projectKpi; if (!id) return;
  const v = e.target.innerText.trim(); const p = state.projects.find((x) => x.id == id);
  if ((p.kpi_2570 ?? "") !== v) save("projects", { id }, { kpi_2570: v }).then((ok) => ok && (p.kpi_2570 = v));
});

// ---------- KPIs ----------
function drawKpis() {
  const actual = (kpiId, m) => state.actuals.find((a) => a.kpi_id === kpiId && a.month === m)?.actual ?? "";
  $("#kpis-table").innerHTML = `
    <thead><tr><th>สาย</th><th>KPI</th><th>เป้า 2570 (ร่าง)</th><th>เก็บข้อมูล</th>${MONTHS.map((m) => `<th class="kpi-month">${m}</th>`).join("")}</tr></thead>
    <tbody>${state.kpis.map((k) => `
      <tr>
        <td class="small">${esc(k.department)}</td><td>${esc(k.name)}</td>
        <td class="small">${esc(k.target)}</td><td class="small">${esc(k.frequency)}</td>
        ${MONTHS.map((_, i) => `<td class="kpi-month" contenteditable="true" data-kpi="${k.id}" data-month="${i + 1}">${esc(actual(k.id, i + 1))}</td>`).join("")}
      </tr>`).join("")}</tbody>`;
}
$("#kpis-table").addEventListener("focusout", async (e) => {
  const kpi_id = Number(e.target.dataset.kpi), month = Number(e.target.dataset.month);
  if (!kpi_id) return;
  const value = e.target.innerText.trim();
  const existing = state.actuals.find((a) => a.kpi_id === kpi_id && a.month === month);
  if ((existing?.actual ?? "") === value) return;
  const { error } = await sb.from("kpi_actuals").upsert({ kpi_id, month, actual: value });
  msg(error ? `บันทึกไม่สำเร็จ: ${error.message}` : "บันทึกแล้ว", !!error);
  if (!error) existing ? (existing.actual = value) : state.actuals.push({ kpi_id, month, actual: value });
});

// ---------- decisions ----------
function drawDecisions() {
  $("#decisions-table").innerHTML = `
    <thead><tr><th>#</th><th>เรื่อง</th><th>รายละเอียด</th><th>กำหนด</th><th>สถานะ</th><th>หมายเหตุ</th></tr></thead>
    <tbody>${state.decisions.map((d) => `
      <tr>
        <td>${d.sort_order}</td><td><strong>${esc(d.topic)}</strong></td>
        <td class="small">${esc(d.detail)}</td><td class="small">${esc(d.deadline)}</td>
        <td>${statusSelect(d.status, DECISION_STATUSES, `data-decision="${d.id}"`)}</td>
        <td contenteditable="true" data-decision-note="${d.id}">${esc(d.note)}</td>
      </tr>`).join("")}</tbody>`;
}
$("#decisions-table").addEventListener("change", async (e) => {
  const id = e.target.dataset.decision; if (!id) return;
  if (await save("decisions", { id }, { status: e.target.value })) {
    state.decisions.find((d) => d.id == id).status = e.target.value; drawOverview();
  }
});
$("#decisions-table").addEventListener("focusout", (e) => {
  const id = e.target.dataset.decisionNote; if (!id) return;
  const note = e.target.innerText.trim(); const d = state.decisions.find((x) => x.id == id);
  if ((d.note ?? "") !== note) save("decisions", { id }, { note }).then((ok) => ok && (d.note = note));
});
