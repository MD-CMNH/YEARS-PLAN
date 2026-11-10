// UX tweaks layered on the original CEO Dashboard page.
(function () {
  const css = document.createElement("style");
  css.textContent = `
    /* collapsible intro text under each tab title */
    .intro-wrap { margin: 0 0 16px; }
    .intro-wrap.shut .intro-more { display: none; }
    .intro-wrap.shut .intro-first { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .intro-wrap .intro-first, .intro-wrap .intro-more { margin: 0 0 6px; }
    .intro-toggle { font: inherit; font-size: 13px; cursor: pointer; color: var(--brand2); background: none; border: 0; padding: 0; text-decoration: underline dotted; }
    /* tab bar: fade at the edge when more tabs are off-screen */
    nav.more-r { -webkit-mask-image: linear-gradient(90deg, #000 85%, transparent); mask-image: linear-gradient(90deg, #000 85%, transparent); }
    nav.more-l { -webkit-mask-image: linear-gradient(90deg, transparent, #000 15%); mask-image: linear-gradient(90deg, transparent, #000 15%); }
    nav.more-l.more-r { -webkit-mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent); mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent); }
    /* show password */
    #gate .pwrow { position: relative; }
    #gate .pwrow input { padding-right: 64px; }
    #gate .pweye { position: absolute; right: 6px; top: 6px; width: auto; font-size: 13px; font-weight: 600; padding: 5px 10px;
      color: #20392F; background: #EFE6D2; border: 1px solid #C9BA97; border-radius: 6px; cursor: pointer; }
    @media print { .intro-toggle { display: none !important; } .intro-wrap.shut .intro-more { display: block !important; }
      .intro-wrap.shut .intro-first { display: block !important; -webkit-line-clamp: unset; } }`;
  document.head.appendChild(css);

  const PRINTING = () => document.body.classList.contains("pdf");

  // 1) intro paragraphs (between the h2 and the first real content) fold to one line
  const open = JSON.parse(localStorage.getItem("cmnh2570:introOpen") || "{}");
  document.querySelectorAll("main > section").forEach((sec) => {
    const h2 = sec.querySelector(":scope > h2");
    if (!h2) return;
    const ps = [];
    for (let el = h2.nextElementSibling; el && el.tagName === "P" && (el.classList.contains("lead") || el.classList.contains("note")); el = el.nextElementSibling) {
      if (el.id) break; // dynamic text (e.g. #salesLead) stays as is
      ps.push(el);
    }
    const text = ps.map((p) => p.textContent).join(" ");
    if (!ps.length || text.length < 110) return;
    const wrap = document.createElement("div");
    wrap.className = "intro-wrap" + (open[sec.id] ? "" : " shut");
    h2.after(wrap);
    ps.forEach((p, i) => { p.classList.add(i ? "intro-more" : "intro-first"); wrap.appendChild(p); });
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "intro-toggle";
    const label = () => (btn.textContent = wrap.classList.contains("shut") ? "▸ อ่านคำอธิบายเพิ่ม" : "▾ ย่อคำอธิบาย");
    btn.onclick = () => {
      wrap.classList.toggle("shut"); label();
      open[sec.id] = !wrap.classList.contains("shut");
      localStorage.setItem("cmnh2570:introOpen", JSON.stringify(open));
    };
    label(); wrap.appendChild(btn);
  });

  // 2) tab bar edge fade
  const nav = document.getElementById("nav");
  if (nav) {
    const upd = () => {
      nav.classList.toggle("more-l", nav.scrollLeft > 4);
      nav.classList.toggle("more-r", nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 4);
    };
    nav.addEventListener("scroll", upd, { passive: true });
    addEventListener("resize", upd);
    new MutationObserver(upd).observe(nav, { childList: true });
    new MutationObserver(() => setTimeout(upd, 50)).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    upd(); setTimeout(upd, 500);
  }

  // 3) show/hide password on the login screen (the gate is built on DOMContentLoaded)
  const addEye = () => {
  const pw = document.getElementById("gatePw");
  if (pw && !PRINTING() && !document.querySelector(".pweye")) {
    const row = document.createElement("div");
    row.className = "pwrow";
    pw.before(row); row.appendChild(pw);
    const eye = document.createElement("button");
    eye.type = "button"; eye.className = "pweye"; eye.textContent = "แสดง";
    eye.setAttribute("aria-label", "แสดงรหัส");
    eye.onclick = () => {
      const show = pw.type === "password";
      pw.type = show ? "text" : "password";
      eye.textContent = show ? "ซ่อน" : "แสดง";
      eye.setAttribute("aria-label", show ? "ซ่อนรหัส" : "แสดงรหัส");
      pw.focus();
    };
    row.appendChild(eye);
  }
  };
  if (document.readyState === "complete") addEye(); else document.addEventListener("DOMContentLoaded", addEye);
})();
