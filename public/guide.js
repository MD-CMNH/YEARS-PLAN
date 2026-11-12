// Reader guide for people new to the plan: "start here" box, reading paths by role,
// one-line purpose under each tab, and glossary tooltips on abbreviations.
(function () {
  const GLOSS = [
    ["CMNH", "บจก. ซีเอ็มเอ็นเอช 2012 · Chiang Mai Nursing Home Care สาขา 1–4 (80 เตียง) และเจ้าของโครงการโรงพยาบาลใหม่"],
    ["TQL", "Tranquila · บจก. แทรงควิลา (แยกนิติบุคคลจาก CMNH) ศูนย์ดูแลผู้สูงอายุ IPD 40 เตียง รวม Villa, VIP และ Day Care"],
    ["Tranquila", "ศูนย์ดูแลผู้สูงอายุของ บจก. แทรงควิลา (TQL) · Tranquila International = การรับผู้พักชาวต่างชาติ"],
    ["รพ.", "โรงพยาบาลใหม่ของกลุ่มที่กำลังก่อสร้าง (OPD + IPD 50 เตียง) แผนเปิด ต.ค. 70"],
    ["IPD", "ผู้ป่วยใน (In-Patient) · ผู้ที่นอนพักรักษา/ดูแลค้างคืน"],
    ["OPD", "ผู้ป่วยนอก (Out-Patient) · มาตรวจหรือรับบริการแล้วกลับบ้าน"],
    ["Villa", "ที่พักดูแลระดับพรีเมียมแบบบ้านแยกหลัง · Villa ใหม่ในโครงการ รพ. 5 หลัง 20 ห้อง"],
    ["Day Care", "ดูแลแบบไปเช้า–เย็นกลับ ไม่พักค้างคืน"],
    ["CEO", "ประธานเจ้าหน้าที่บริหาร · กำหนดทิศทางและกลยุทธ์ อนุมัติเรื่องใหญ่ กำกับ MD"],
    ["MD", "กรรมการผู้จัดการ (Managing Director) · บริหารการดำเนินงานทุกหน่วยโดยตรง รายงาน CEO"],
    ["Board", "คณะกรรมการบริษัท · อนุมัติโครงสร้าง นโยบาย และเรื่องตามอำนาจกรรมการ"],
    ["Group Managers", "หัวหน้าส่วนกลาง 6 ฝ่าย (Finance, HR, Operations, Quality, Marketing, Business Development) ให้บริการทุกหน่วย"],
    ["Unit Director", "ผู้บริหารหน่วยธุรกิจ เช่น สาขา 1–4, Tranquila, รพ., Villa"],
    ["KPI", "ตัวชี้วัดผลงาน (Key Performance Indicator) · ตัวเลขที่ใช้วัดว่างานได้ผลตามเป้าหรือไม่"],
    ["SOP", "ระเบียบปฏิบัติมาตรฐาน (Standard Operating Procedure) · ขั้นตอนทำงานที่ทุกคนทำเหมือนกัน"],
    ["JD", "คำบรรยายลักษณะงาน (Job Description) · หน้าที่ คุณสมบัติ และผู้บังคับบัญชาของแต่ละตำแหน่ง"],
    ["DOA", "ตารางอำนาจอนุมัติ (Delegation of Authority) · ใครอนุมัติเรื่องอะไรได้ ในวงเงินเท่าไร"],
    ["ส.พ.", "แบบคำขอใบอนุญาตประกอบกิจการสถานพยาบาล ตาม พ.ร.บ.สถานพยาบาล"],
    ["สสจ.", "สำนักงานสาธารณสุขจังหวัด"],
    ["สบส.", "กรมสนับสนุนบริการสุขภาพ · หน่วยงานออกใบอนุญาตและตรวจสถานพยาบาล/สถานดูแลผู้สูงอายุ"],
    ["Go / No-go", "เกณฑ์ตัดสินใจก่อนเปิดบริการ · ผ่านครบทุกข้อจึงเปิด"],
    ["lead", "ผู้สนใจที่ติดต่อเข้ามา แต่ยังไม่ตัดสินใจใช้บริการ"],
    ["SHP", "Swiss Helping Point · พันธมิตรแนะนำผู้พักจากสวิตเซอร์แลนด์"],
    ["RN", "พยาบาลวิชาชีพ (Registered Nurse)"],
    ["TMS", "การกระตุ้นสมองด้วยสนามแม่เหล็ก (Transcranial Magnetic Stimulation) · ทำโดยนักกายภาพบำบัด"],
    ["PMS", "การกระตุ้นเส้นประสาทส่วนปลายด้วยสนามแม่เหล็ก (Peripheral Magnetic Stimulation) · ทำโดยนักกายภาพบำบัด"],
    ["PT", "กายภาพบำบัด (Physical Therapy)"],
    ["OT", "กิจกรรมบำบัด (Occupational Therapy)"],
    ["ภงด.51", "ภาษีเงินได้นิติบุคคลครึ่งปี (ชำระล่วงหน้า)"],
    ["Q1", "ไตรมาส 1 = ม.ค.–มี.ค. (Q2 เม.ย.–มิ.ย. · Q3 ก.ค.–ก.ย. · Q4 ต.ค.–ธ.ค.)"],
  ];
  const TABINFO = {
    sum: ["เรื่องที่ CEO ต้องตัดสินใจ และผลจริงปี 2569 ของธุรกิจเดิม", "CEO · Board · ผู้บริหาร"],
    plan: ["งานหลักแต่ละไตรมาส คลิกงานเพื่อดูขั้นตอน ผู้รับผิดชอบ และเอกสาร", "ทุกคน"],
    tasks: ["รายการงาน ผู้รับผิดชอบ กำหนดส่ง และสถานะ (อัปเดตได้ ทีมเห็นร่วมกัน)", "หัวหน้าแผนก · ผู้รับผิดชอบงาน"],
    proj: ["6 โปรเจ็คที่ทำต่อเนื่อง เป้าหมาย และเจ้าของโปรเจ็ค", "เจ้าของโปรเจ็ค · ฝ่ายการตลาด"],
    org: ["ผังองค์กร ใครรายงานใคร และหน้าที่ของแต่ละตำแหน่ง (JD)", "พนักงานใหม่ · ทุกคน"],
    gov: ["กติกาการบริหาร และใครอนุมัติอะไรได้ (DOA)", "ผู้บริหาร · Board · ผู้อนุมัติเอกสาร"],
    fin: ["ทดลองปรับสมมติฐานโครงการ รพ. + Villa ดูเงินที่ต้องเตรียมและจุดคุ้มทุน", "ผู้บริหาร · ฝ่ายการเงิน"],
    sales: ["ต้องหาผู้พักกี่รายเพื่อเติมเตียง และหาจากช่องทางไหน", "ฝ่ายการตลาดและขาย"],
    kpi: ["ตัวชี้วัดรายเดือน กรอกผลจริงเทียบเป้า และดูว่าสายไหนผ่าน", "หัวหน้าแต่ละสาย · HR"],
    docs: ["คลังเอกสาร: SOP แบบฟอร์ม JD นโยบาย เปิด พิมพ์ หรือบันทึกเป็น PDF ได้", "ทุกคน"],
  };
  const PATHS = [
    ["พนักงานใหม่", [["year", "ภาพรวมปี"], ["org", "โครงสร้าง + JD"], ["docs", "SOP ของแผนก"]]],
    ["หัวหน้าแผนก", [["tasks", "งานของฉัน"], ["kpi", "KPI"], ["plan", "แผนไตรมาส"], ["docs", "เอกสาร"]]],
    ["ผู้บริหาร / Board", [["sum", "สรุป CEO"], ["fin", "การเงิน"], ["gov", "ธรรมาภิบาล"]]],
    ["การตลาดและขาย", [["proj", "โปรเจ็ค"], ["sales", "การขาย"], ["kpi", "KPI"]]],
  ];

  const css = document.createElement("style");
  css.textContent = `
    .start{margin:0 0 18px;border:1px solid #DCCFB2;border-left:5px solid #C99A47;border-radius:9px;background:linear-gradient(#FFFEFA,#F8F2E4);box-shadow:0 4px 10px -6px rgba(80,60,20,.3)}
    .start>summary{list-style:none;cursor:pointer;padding:12px 16px;font-weight:700;color:#20392F;display:flex;align-items:center;gap:10px}
    .start>summary::-webkit-details-marker{display:none}
    .start>summary::after{content:"ซ่อน ▴";margin-left:auto;font-size:12.5px;font-weight:500;color:var(--brand2)}
    .start:not([open])>summary::after{content:"อ่าน ▾"}
    .start .sb{padding:0 16px 14px;display:grid;grid-template-columns:1.1fr 1fr;gap:18px}
    .start h4{margin:4px 0 6px;font-size:14.5px;color:#20392F}
    .start ul{margin:0;padding-left:18px;font-size:14px}.start li{margin:3px 0}
    .paths{display:grid;gap:8px}
    .path{display:flex;flex-wrap:wrap;align-items:center;gap:5px;font-size:13.5px}
    .path b{min-width:112px;color:#3A3222}
    .path button{font:inherit;font-size:13px;cursor:pointer;padding:2px 10px;border-radius:99px;border:1px solid #C9BA97;background:#FFF9EA;color:#20392F}
    .path button:hover{background:#2F6B57;color:#fff;border-color:#2F6B57}
    .path i{font-style:normal;color:#B8A57E}
    .gloss{margin-top:8px}.gloss summary{cursor:pointer;font-size:13.5px;color:var(--brand2);text-decoration:underline dotted}
    .gloss dl{display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;margin:8px 0 0;font-size:13.5px}
    .gloss dt{font-weight:700;color:#20392F}.gloss dd{margin:0;color:var(--mute)}
    .tabguide{display:flex;flex-wrap:wrap;gap:4px 14px;margin:2px 0 12px;font-size:13px;color:var(--mute);padding:6px 10px;background:rgba(201,154,71,.09);border-radius:7px}
    .tabguide b{color:#3A3222;font-weight:600}
    abbr.gl{text-decoration:underline dotted #B8893B;text-underline-offset:3px;cursor:help;border:0}
    #gtip{position:fixed;z-index:61;pointer-events:none;background:#20392F;color:#F6EBCB;font-size:13px;line-height:1.5;padding:7px 11px;border-radius:7px;box-shadow:0 6px 16px rgba(0,0,0,.3);display:none;max-width:300px}
    #gtip b{color:#F4E2AE}
    @media(max-width:800px){.start .sb{grid-template-columns:1fr}.path b{min-width:100%}}
    @media print{.start,.tabguide{display:none!important}abbr.gl{text-decoration:none}}`;
  document.head.appendChild(css);

  const go = (id) => { if (typeof window.show === "function") { window.show(id); window.scrollTo({ top: 0 }); } };

  // 1) start-here box on the year tab
  const year = document.getElementById("year");
  if (year) {
    const KEY = "cmnh2570:startOpen", open = localStorage.getItem(KEY) !== "0";
    const d = document.createElement("details");
    d.className = "start"; d.open = open;
    d.innerHTML = `<summary>👋 เริ่มที่นี่: แผนนี้คืออะไร และควรอ่านตรงไหนก่อน</summary><div class="sb">
      <div><h4>กลุ่มบริษัทของเรา</h4><ul>
        <li><b>บจก. ซีเอ็มเอ็นเอช 2012 (CMNH)</b> ศูนย์ดูแลผู้สูงอายุและผู้ป่วย 4 อาคาร 80 เตียง พร้อมกายภาพบำบัด TMS/PMS และดูแลที่บ้าน</li>
        <li><b>บจก. แทรงควิลา (TQL · Tranquila)</b> ศูนย์ดูแลผู้สูงอายุ IPD 40 เตียง รวม Villa, VIP และ Day Care</li>
        <li><b>โครงการใหม่ปีนี้</b> โรงพยาบาล (OPD + IPD 50 เตียง) และ Villa ใหม่ 5 หลัง เปิด ต.ค.–พ.ย. 70 · ก่อนหน้านั้นเปิดคลินิกที่อาคารหน้า รพ. ตั้งแต่ ม.ค. 70</li>
      </ul><h4 style="margin-top:10px">ปี 2570 ในประโยคเดียว</h4>
      <p style="margin:0;font-size:14px">ครึ่งปีแรก <b>วางระบบ</b> (โครงสร้าง KPI SOP) ครึ่งปีหลัง <b>เปิดบริการใหม่</b> (โรงพยาบาล Villa และลูกค้าต่างประเทศ)</p></div>
      <div><h4>อ่านตามบทบาทของคุณ</h4><div class="paths">${PATHS.map(([r, steps]) => `<div class="path"><b>${r}</b>${steps.map(([id, l], i) => (i ? "<i>→</i>" : "") + `<button data-go="${id}">${l}</button>`).join("")}</div>`).join("")}</div>
      <p class="note" style="margin:10px 0 0">คำที่มี<abbr class="gl" data-k="__demo" style="cursor:default">เส้นประใต้</abbr> ชี้หรือแตะเพื่อดูความหมาย · คลิกแถบใน Roadmap เพื่อดูรายละเอียดงาน</p>
      <details class="gloss"><summary>คำศัพท์และคำย่อทั้งหมด (${GLOSS.length} คำ)</summary><dl>${GLOSS.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></details></div></div>`;
    d.addEventListener("toggle", () => localStorage.setItem(KEY, d.open ? "1" : "0"));
    d.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => go(b.dataset.go)));
    year.insertBefore(d, year.firstChild);
  }

  // 2) one-line purpose + audience under each tab title, and as the tab's tooltip
  Object.entries(TABINFO).forEach(([id, [what, who]]) => {
    const h2 = document.querySelector(`#${id} > h2`);
    if (h2) h2.insertAdjacentHTML("afterend", `<div class="tabguide"><span><b>ใช้ทำอะไร:</b> ${what}</span><span><b>ใครควรอ่าน:</b> ${who}</span></div>`);
  });
  const tagTabs = () => document.querySelectorAll("nav button[data-id]").forEach((b) => { const t = TABINFO[b.dataset.id]; if (t) b.title = t[0]; });
  tagTabs();

  // 3) glossary tooltips: mark the first use of each term in each tab / document view
  const MAP = new Map(GLOSS.map(([k, v]) => [k, v]));
  const escR = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const keys = GLOSS.map((g) => g[0]).sort((a, b) => b.length - a.length);
  const RE = new RegExp(keys.map((k) => (/^[A-Za-z]/.test(k) ? `(?<![A-Za-z0-9])${escR(k)}(?![A-Za-z0-9])` : escR(k))).join("|"), "g");
  const RE1 = new RegExp(RE.source);
  const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "BUTTON", "ABBR", "SUMMARY", "H2", "TH", "CODE"]);
  function mark(root) {
    if (!root) return;
    const done = new Set([...root.querySelectorAll("abbr.gl")].map((a) => a.dataset.k));
    if (done.size >= keys.length) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        for (let p = n.parentElement; p && p !== root; p = p.parentElement) {
          if (SKIP.has(p.tagName) || p.closest("svg,.start,.gloss,.tabguide,#ctip")) return NodeFilter.FILTER_REJECT;
        }
        return RE1.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });
    const nodes = []; for (let n; (n = w.nextNode()); ) nodes.push(n);
    nodes.forEach((n) => {
      RE.lastIndex = 0;
      const s = n.nodeValue; let m, last = 0, frag = null;
      while ((m = RE.exec(s))) {
        const k = m[0]; if (done.has(k)) continue; done.add(k);
        frag = frag || document.createDocumentFragment();
        frag.appendChild(document.createTextNode(s.slice(last, m.index)));
        const a = document.createElement("abbr"); a.className = "gl"; a.dataset.k = k; a.textContent = k; frag.appendChild(a);
        last = m.index + k.length;
      }
      if (frag) { frag.appendChild(document.createTextNode(s.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
    RE.lastIndex = 0;
  }
  const roots = () => [...document.querySelectorAll("main > section.on"), document.getElementById("mbody")];
  let busy = false, tm;
  const run = () => { if (busy) return; busy = true; try { roots().forEach(mark); } finally { busy = false; } };
  run();
  if (typeof window.show === "function") { const orig = window.show; window.show = function (id) { const r = orig.apply(this, arguments); setTimeout(run, 50); return r; }; }
  new MutationObserver(() => { if (busy) return; clearTimeout(tm); tm = setTimeout(run, 120); })
    .observe(document.body, { childList: true, subtree: true });

  // tooltip
  const tip = document.createElement("div"); tip.id = "gtip"; document.body.appendChild(tip);
  const showTip = (a, x, y) => { const k = a.dataset.k; if (!MAP.has(k)) return; tip.innerHTML = `<b>${k}</b> · ${MAP.get(k)}`; tip.style.display = "block";
    tip.style.left = Math.max(8, Math.min(innerWidth - tip.offsetWidth - 8, x)) + "px"; tip.style.top = y + "px"; };
  document.addEventListener("mouseover", (e) => { const a = e.target.closest && e.target.closest("abbr.gl"); if (a) { const r = a.getBoundingClientRect(); showTip(a, r.left, r.bottom + 6); } else tip.style.display = "none"; });
  document.addEventListener("click", (e) => { const a = e.target.closest && e.target.closest("abbr.gl"); if (a) { const r = a.getBoundingClientRect(); showTip(a, r.left, r.bottom + 6); } else tip.style.display = "none"; });
  addEventListener("scroll", () => (tip.style.display = "none"), { passive: true });
})();
