/* Feature design renderer: draws every tab from window.FEATURE (data.js) and keeps decisions in the page's db.
   Keep it compatible with older data.js files: pages are republished with whatever app.js is current. */
(() => {
const F = window.FEATURE;
const main = document.getElementById("top");
if (!F) { main.textContent = "data.js did not load."; return; }

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const txt = html => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent; };
const tint = color => `--c:var(--c-${color});--cs:var(--c-${color}-soft)`;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const days = ([lo, hi]) => lo === hi ? `${lo} d` : `${lo}–${hi} d`;

const SYSTEMS = F.systems || [];
const SYS = Object.fromEntries(SYSTEMS.map(s => [s.key, s]));
const SIDES = F.sides && F.sides.length ? F.sides : [{ key: "backend", name: "Backend", color: "blue" }];
const SIDE = Object.fromEntries(SIDES.map(s => [s.key, s]));
const Q = F.questions || [];
const QBY = Object.fromEntries(Q.map(q => [q.id, q]));
const LANES = F.lanes || [];
const CH = F.chunks || [];
const CBY = Object.fromEntries(CH.map(c => [c.id, c]));
const D = F.deliverables && F.deliverables.items && F.deliverables.items.length ? F.deliverables : null;
const RAW = F.sections || [];
const multiSys = SYSTEMS.length > 1, multiSide = SIDES.length > 1;
const accent = SYS[F.accent] || SYSTEMS[SYSTEMS.length - 1] || { color: "amber" };
document.documentElement.style.setProperty("--accent", `var(--c-${accent.color})`);
document.documentElement.style.setProperty("--accent-soft", `var(--c-${accent.color}-soft)`);
document.title = F.title;

const sysColor = key => (SYS[key] || accent).color;
const qn = id => QBY[id] ? QBY[id].n : id;
const blocksOf = id => CH.filter(c => (c.waits || []).includes(id)).map(c => c.id);
const sum = list => list.reduce((a, c) => [a[0] + c.s[0], a[1] + c.s[1]], [0, 0]);

const decisions = {}, pick = {};
let filter = "all", store = null, userNs = null, myId = null, writable = true;
const isDone = id => !!decisions[id] && decisions[id].state === "decided";
const openOf = list => (list || []).filter(w => !isDone(w));
const optLabel = (q, k) => { const o = q.opts.find(x => x[0] === k); return o ? txt(o[1]) : k; };

/* ---------- layout ---------- */
const has = x => !!(x && x.length);
const TABS = [
  ["overview", "Overview", true],
  ["decisions", "Decisions", true],
  ["api", "API", has(F.api && F.api.items)],
  ["data", "Data", has(F.data && F.data.items)],
  ["tasks", "Tasks", has(CH)],
  ["order", "Build order", has(F.order && F.order.phases) || has(F.order && F.order.deps && F.order.deps.rows)],
  ["open", "Open items", true],
  ["facts", "Code facts", has(F.facts && F.facts.groups)],
  ["glossary", "Glossary", has(F.glossary && F.glossary.groups)]
].filter(([k, , on]) => on || RAW.some(r => r.tab === k));
const TAB_KEYS = TABS.map(t => t[0]);
const panels = {};

function section(title, sub, id) {
  const s = el("section"); if (id) s.id = id;
  if (title) s.append(el("h2", null, title));
  if (sub) s.append(el("p", "sub", sub));
  return s;
}
function xall(selector, cls) {
  const w = el("span", "xall" + (cls ? " " + cls : ""));
  [["open", "Expand all"], ["close", "Collapse all"]].forEach(([mode, label]) => {
    const b = el("button", "xbtn", label); b.type = "button";
    b.addEventListener("click", () => document.querySelectorAll(selector + " details.cx").forEach(d => { if (!d.hidden) d.open = mode === "open"; }));
    w.append(b);
  });
  return w;
}
function table(cols, rows, cls, firstCls) {
  const tw = el("div", "tw"), t = el("table", "grid" + (cls ? " " + cls : ""));
  t.append(el("thead", null, `<tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr>`));
  const tb = el("tbody"); rows.forEach(r => tb.append(el("tr", null, r.map((c, i) => `<td${i === 0 && firstCls ? ` class="${firstCls}"` : ""}>${c}</td>`).join("")))); t.append(tb);
  tw.append(t); return tw;
}
function code(s) {
  return String(s).split("\n").map(l => l.startsWith("##")
    ? `<span class="add">${esc(l.slice(2))}</span>`
    : esc(l).replace(/(^|\s)(\/\/.*)$/, '$1<span class="cm">$2</span>')).join("\n");
}

function buildNav() {
  const nav = $("#nav");
  const brand = el("a", "brand", F.brand || F.title); brand.href = "#overview"; nav.append(brand);
  TABS.forEach(([k, label]) => { const a = el("a", null, `${label}<span class="n" id="n-${k}"></span>`); a.href = "#" + k; a.dataset.tablink = k; nav.append(a); });
}

/* ---------- overview ---------- */
function summaryBox(id, href, link) {
  const b = el("div", "summary");
  b.innerHTML = `<div class="head"><b id="${id}-title"></b><a class="go" href="${href}">${link}</a></div><div class="sbar" id="${id}-bar"></div><div class="slegend" id="${id}-legend"></div>`;
  return b;
}
function mapNode([t, s, sys]) {
  const d = el("div", "nd" + (sys ? " tinted" : ""), `<b>${t}</b>${s ? `<small>${s}</small>` : ""}`);
  if (sys) d.style.cssText = tint(sysColor(sys));
  return d;
}
function renderOverview(p) {
  const hero = el("header", "hero");
  hero.append(el("h1", null, F.title));
  if (F.lede) hero.append(el("p", "lede", F.lede));
  if (F.meta) hero.append(el("p", "meta", F.meta));
  if (has(F.agreed)) {
    const a = el("div", "agreed"); a.setAttribute("aria-label", "Agreed"); a.append(el("span", "lab", "Agreed"));
    F.agreed.forEach(([html, sys]) => { const s = el("span", "pill", `<i></i>${html}`); s.style.cssText = tint(sysColor(sys)); a.append(s); });
    hero.append(a);
  }
  p.append(hero);
  const s = el("section"), two = el("div", "twobox");
  two.append(summaryBox("qsum", "#decisions", "Open decisions tab"));
  if (CH.length) two.append(summaryBox("csum", "#tasks", "Open tasks tab"));
  s.append(two); p.append(s);
  if (D) {
    const m = section(`Status by ${D.name}`, D.sub || `The chunks each ${D.name} needs. A chunk is ready when every question it waits on is decided; yellow chunks name the question still open.`);
    const mx = el("div", "matrix"); mx.id = "matrix"; m.append(mx); p.append(m);
  }
  if (F.map) {
    const M = F.map, m = section(M.title, M.sub, "map"), fm = el("div", "flowmap");
    const col = c => { const d = el("div", "fcol"); d.append(el("div", "lab", c.label)); (c.nodes || []).forEach(n => d.append(mapNode(n))); return d; };
    const core = el("div", "core"); core.style.cssText = tint(sysColor(M.core.system));
    core.append(el("div", "lab", M.core.label || (SYS[M.core.system] || {}).name || ""), el("h4", null, M.core.title));
    (M.core.nodes || []).forEach(n => core.append(mapNode(n)));
    fm.append(col(M.left), core, col(M.right)); m.append(fm); p.append(m);
  }
  if (has(F.sources)) {
    const m = section("Sources"), ul = el("ul", "sources");
    F.sources.forEach(x => ul.append(el("li", null, x))); m.append(ul); p.append(m);
  }
}

/* ---------- decisions ---------- */
function renderDecisions(p) {
  const s = section("Decisions", (F.decisions && F.decisions.sub) || "Each question has the facts, the options and a recommendation. Pick an option, add a note if needed and record it. The page saves your name and the time, and keeps earlier answers. Green is decided, yellow is still open.", "questions");
  const bar = el("div", "toolbar"); bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Filter questions");
  const filters = [["all", "All"], ...(multiSide ? SIDES.map(x => [x.key, x.name]) : []), ["open", "Open"], ["done", "Decided"]];
  filters.forEach(([f, label]) => {
    const b = el("button", "fbtn", label); b.type = "button"; b.dataset.f = f;
    b.addEventListener("click", () => { filter = f; applyFilter(); }); bar.append(b);
  });
  const x = xall("#questions"); x.style.marginLeft = "8px"; bar.append(x);
  const sync = el("span", "sync", "Connecting to saved decisions…"); sync.id = "sync"; sync.setAttribute("aria-live", "polite"); bar.append(sync);
  s.append(bar);
  SIDES.forEach(side => {
    if (multiSide) { const h = el("h3", "sh", side.title || `${side.name} decides`); h.id = "h-" + side.key; s.append(h); }
    const g = el("div", "stack"); g.id = "q-" + side.key;
    Q.filter(q => q.side === side.key).forEach(q => g.append(questionCard(q)));
    s.append(g);
  });
  p.append(s);
}

function questionCard(q) {
  const card = el("details", "q cx"); card.id = "q-" + q.id;
  const summ = el("summary"), body = el("div", "cx-body"), head = el("div", "qh");
  head.append(el("span", "qid", q.n), el("h4", null, q.t));
  if (multiSide) { const t = el("span", "side", SIDE[q.side].name); t.style.cssText = tint(SIDE[q.side].color); head.append(t); }
  const st = el("span", "ds", "Open"); st.dataset.r = "st"; head.append(st);
  const gist = el("div", "cx-gist"); gist.dataset.r = "gist";
  summ.append(head, gist); card.append(summ, body);
  body.append(el("p", "ctx", q.ctx || ""));
  const refs = el("div", "refs"); refs.dataset.r = "refs"; body.append(refs);
  const opts = el("div", "opts"); opts.setAttribute("role", "radiogroup"); opts.setAttribute("aria-label", txt(q.t));
  q.opts.forEach(([key, label, note]) => {
    const b = el("button", "opt"); b.type = "button"; b.setAttribute("role", "radio"); b.dataset.k = key;
    b.innerHTML = `<i class="odot" aria-hidden="true"></i><div><b>${label}</b>${key === q.rec ? '<em class="rec">Recommended</em>' : ""}${note ? `<span>${note}</span>` : ""}</div>`;
    b.addEventListener("click", () => { pick[q.id] = key; paintQuestion(q); });
    opts.append(b);
  });
  body.append(opts);
  if (q.why) body.append(el("p", "why", q.why));
  const dec = el("div", "drec"), who = el("div", "qwho"); who.dataset.r = "who";
  const ta = el("textarea"); ta.dataset.r = "note"; ta.placeholder = "Note for the team (optional)"; ta.setAttribute("aria-label", "Note for " + q.n);
  const row = el("div", "drow");
  const save = el("button", "btn", "Record decision"); save.type = "button"; save.dataset.r = "save"; save.addEventListener("click", () => record(q));
  const reopen = el("button", "btn ghost", "Reopen"); reopen.type = "button"; reopen.dataset.r = "reopen"; reopen.addEventListener("click", () => reopenQ(q));
  const msg = el("span", "msg"); msg.dataset.r = "msg";
  row.append(save, reopen, msg);
  const hist = el("details", "hist"); hist.dataset.r = "hist"; hist.hidden = true;
  dec.append(who, ta, row, hist); body.append(dec);
  return card;
}
const part = (root, r) => root.querySelector(`[data-r="${r}"]`);

function paintQuestion(q) {
  const root = document.getElementById("q-" + q.id); if (!root) return;
  const d = decisions[q.id], done = isDone(q.id), sel = pick[q.id] || (done ? d.opt : q.rec);
  const blocks = blocksOf(q.id), after = openOf(q.needs);
  root.classList.toggle("done", done);
  part(root, "gist").innerHTML = done
    ? `<span class="ok">Decided ${esc(String(d.opt).toUpperCase())}:</span> ${esc(optLabel(q, d.opt))}`
    : `Recommended: ${esc(optLabel(q, q.rec))}` + (blocks.length ? ` · blocks ${blocks.join(", ")}` : "") + (after.length ? ` · after ${after.map(qn).join(", ")}` : "");
  const refs = part(root, "refs"); refs.textContent = "";
  (q.needs || []).forEach(w => { const a = el("a", "chip " + (isDone(w) ? "ok" : "w"), (isDone(w) ? "✓ after " : "after ") + esc(qn(w))); a.href = "#q-" + w; a.title = QBY[w] ? txt(QBY[w].t) : w; refs.append(a); });
  (q.refs || []).forEach(r => refs.append(el("span", "chip", r)));
  blocks.forEach(b => { const a = el("a", "chip b", "blocks " + esc(b)); a.href = "#bk-" + b; refs.append(a); });
  refs.hidden = !refs.childElementCount;
  root.querySelectorAll(".opt").forEach(b => { b.setAttribute("aria-checked", String(b.dataset.k === sel)); b.classList.toggle("chosen", done && b.dataset.k === d.opt); });
  const st = part(root, "st"); st.textContent = done ? "Decided: " + String(d.opt).toUpperCase() : "Open"; st.className = "ds" + (done ? " decided" : "");
  const save = part(root, "save");
  save.textContent = done && sel === d.opt ? "Update note" : (done ? "Change decision" : (sel === q.rec ? "Accept recommendation" : "Record decision"));
  save.disabled = !store || !myId || !writable;
  const reopen = part(root, "reopen"); reopen.hidden = !done; reopen.disabled = !store || !writable;
  paintWho(q, root);
}

async function paintWho(q, root) {
  const who = part(root, "who"), hist = part(root, "hist"), d = decisions[q.id];
  if (!d) { who.textContent = ""; who.append(el("span", "note", store ? "No decision yet." : "Decisions load when the page is opened in Claude.")); hist.hidden = true; return; }
  const ids = [d.by, ...(d.history || []).map(h => h.by)].filter(Boolean);
  const ps = userNs ? await userNs.profiles(ids) : {};
  const nameOf = id => (ps[id] && ps[id].name) || "Someone";
  who.textContent = "";
  if (ps[d.by] && ps[d.by].avatarUrl) { const img = el("img"); img.src = ps[d.by].avatarUrl; img.alt = ""; who.append(img); }
  const line = el("span");
  line.textContent = `${nameOf(d.by)} ${d.state === "decided" ? `chose ${String(d.opt).toUpperCase()}: ${optLabel(q, d.opt)}` : "reopened it"} · ${fmt(d.at)}`;
  who.append(line);
  if (d.note) { const n = el("span", "note"); n.textContent = "· " + d.note; who.append(n); }
  const h = d.history || [];
  hist.hidden = !h.length; hist.textContent = "";
  if (h.length) {
    const s = el("summary"); s.textContent = `Earlier (${h.length})`; hist.append(s);
    const ol = el("ol");
    h.slice().reverse().forEach(x => { const li = el("li"); li.textContent = `${nameOf(x.by)} ${x.state === "decided" ? "chose " + String(x.opt).toUpperCase() : "reopened"} · ${fmt(x.at)}${x.note ? " · " + x.note : ""}`; ol.append(li); });
    hist.append(ol);
  }
}
function fmt(iso) { try { return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); } catch { return ""; } }

function applyFilter() {
  Q.forEach(q => {
    const c = document.getElementById("q-" + q.id), done = isDone(q.id);
    c.hidden = !(filter === "all" || filter === q.side || (filter === "open" && !done) || (filter === "done" && done));
  });
  if (multiSide) SIDES.forEach(side => { $("#h-" + side.key).hidden = !Q.some(q => q.side === side.key && !document.getElementById("q-" + q.id).hidden); });
  document.querySelectorAll(".fbtn").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.f === filter)));
}

/* ---------- api and data ---------- */
function renderApi(p) {
  const A = F.api, s = section(A.title || "API", A.sub || "Highlighted lines are new.");
  const x = xall("#apis"); x.style.margin = "0 0 12px"; s.append(x);
  const host = el("div", "stack"); host.id = "apis";
  A.items.forEach((a, i) => {
    const from = SYS[a.from || A.from], to = SYS[a.to || A.to];
    const label = (word, sys) => `<span class="h">${word}${sys && multiSys ? " · " + esc(sys.name) : ""}</span>`;
    const det = el("details", "api cx"); det.id = a.id || "api-" + (i + 1);
    const added = String(a.after || "").split("\n").filter(l => l.startsWith("##")).length;
    const summ = el("summary"); summ.append(el("div", "cardh", `<b>${esc(a.p)}</b><span>${a.d || ""}</span>`),
      el("div", "cx-gist", a.before ? `${added} new ${added === 1 ? "line" : "lines"} beside today's shape` : "New"));
    const body = el("div", "cx-body");
    if (a.before) { const pair = el("div", "pair"); pair.append(el("pre", null, label("Today", from) + code(a.before)), el("pre", null, label("After", to) + code(a.after))); body.append(pair); }
    else body.append(el("pre", null, label("New", to) + code(a.after)));
    det.append(summ, body); host.append(det);
  });
  s.append(host); p.append(s);
}
function renderData(p) {
  const A = F.data, s = section(A.title || "Data", A.sub || "Highlighted lines are new.");
  const x = xall("#datas"); x.style.margin = "0 0 12px"; s.append(x);
  const host = el("div", "stack"); host.id = "datas";
  A.items.forEach((m, i) => {
    const det = el("details", "cx"); det.id = m.id || "d-" + (i + 1);
    const summ = el("summary"); summ.append(el("div", "cardh", `<b>${esc(m.name)}</b><span>${m.store || ""}</span>`));
    if (m.gist) summ.append(el("div", "cx-gist", m.gist));
    const body = el("div", "cx-body"); body.append(el("pre", null, code(m.code || "")));
    det.append(summ, body); host.append(det);
  });
  s.append(host); p.append(s);
}

/* ---------- tasks and build order ---------- */
function chunkCard(c) {
  const det = el("details", "bk cx"); det.id = "bk-" + c.id; det.style.cssText = tint(sysColor(c.by));
  det.innerHTML = `<summary><div class="bkh"><span class="id">${esc(c.id)}</span><span class="nm">${c.n}${multiSys && SYS[c.by] ? `<span class="where">${esc(SYS[c.by].name)}</span>` : ""}</span><span class="sz">${days(c.s)}</span></div><div class="cx-gist" data-r="gist"></div></summary><div class="cx-body"><p>${c.p || ""}</p><div class="refs" data-r="refs"></div></div>`;
  return det;
}
function renderTasks(p) {
  const T = F.tasks || {}, s = section(T.title || "What gets built", T.sub || "A chunk turns ready when every question it waits on is decided.", "build");
  LANES.forEach((lane, i) => {
    const head = el("div", "sechead"); head.append(el("h3", "sh", lane.title || lane.name));
    if (i === 0) head.append(xall("#build .lane", "right"));
    const host = el("div", "lane"); host.id = "lane-" + lane.key;
    CH.filter(c => c.lane === lane.key).forEach(c => host.append(chunkCard(c)));
    s.append(head, host);
  });
  const tot = el("div", "tot");
  if (LANES.length > 1) LANES.forEach(l => tot.append(el("span", null, `${l.name} <b>${days(sum(CH.filter(c => c.lane === l.key)))}</b>`)));
  tot.append(el("span", null, `Total <b>${days(sum(CH))}</b>`));
  if (T.note) tot.append(el("span", "note", T.note));
  s.append(tot);
  if (D) {
    s.append(el("h3", "sh", `${cap(D.names || D.name + "s")} and the work they need`));
    s.append(table([cap(D.name), D.what || "What it delivers", "Chunks"], D.items.map(([id, what, ids]) => [esc(id), what, ids.map(c => `<a class="chip b" href="#bk-${esc(c)}">${esc(c)}</a>`).join(" ")]), null, "mono"));
  }
  p.append(s);
}
function renderOrder(p) {
  const O = F.order || {};
  if (has(O.phases)) {
    const s = section(O.title || "Build order", O.sub), ph = el("div", "phases");
    O.phases.forEach((x, i) => {
      const withChunks = has(x.chunks) || !!x.lane;
      const d = el("div", "phase" + (withChunks ? "" : " later"));
      d.append(el("div", "k", x.k || `Phase ${i + 1}`), el("h3", null, x.t));
      if (x.lead) d.append(el("p", "lead", x.lead));
      if (withChunks) { const c = el("div", "chips"); c.dataset.phase = String(i); d.append(c); }
      if (has(x.items)) { const ul = el("ul"); x.items.forEach(([t, sub]) => ul.append(el("li", null, `${t}${sub ? `<span>${sub}</span>` : ""}`))); d.append(ul); }
      ph.append(d);
    });
    s.append(ph); p.append(s);
  }
  if (O.deps && has(O.deps.rows)) {
    const s = section(O.deps.title || "Dependencies", O.deps.sub, "deps");
    s.append(table(["Needs", "From", "Used for", "Until it exists"], O.deps.rows, null, "nw")); p.append(s);
  }
}
function phaseChunks(x) { return has(x.chunks) ? x.chunks : CH.filter(c => c.lane === x.lane).map(c => c.id); }

/* ---------- open items, facts, glossary ---------- */
function renderOpen(p) {
  const s = section("Open items", "Questions still waiting for an answer, and what each one holds up. The list shrinks as decisions are recorded.");
  const ol = el("div", "olist"); ol.id = "olist"; s.append(ol); p.append(s);
  const G = F.gaps;
  if (G && has(G.rows)) {
    const g = section(G.title || "Requirements no task covers yet", G.sub && G.sub.replace("{n}", G.rows.length), G.id || "gaps");
    g.append(table(G.cols || ["Requirement", "What it asks", "Lands in"], G.rows, null, "mono")); p.append(g);
  }
}
function renderFacts(p) {
  const A = F.facts, s = section(A.title || "Code facts behind the answers", A.sub || "What the code does today. Paths are relative to each repo root.");
  A.groups.forEach(g => {
    const sys = SYS[g.system] || {};
    s.append(el("h3", "sh", g.title || sys.long || sys.name || ""));
    const host = el("div", "facts");
    g.items.forEach(([t, path]) => { const c = el("div", "fact", t); c.style.cssText = tint(sysColor(g.system)); if (path) { const k = el("code", "p"); k.textContent = path; c.append(k); } host.append(c); });
    s.append(host);
  });
  p.append(s);
}
function renderGlossary(p) {
  const A = F.glossary, s = section(A.title || "Glossary", A.sub || "Terms and ids this page uses, above all the ones that go by several names.");
  const rows = [];
  A.groups.forEach(g => { if (g.name) rows.push(null, g.name); g.terms.forEach(t => rows.push(t)); });
  const tw = table(["Term", "Meaning", "Where from"], [], "gloss"), tb = tw.querySelector("tbody");
  for (let i = 0; i < rows.length; i++) {
    if (rows[i] === null) { tb.append(el("tr", "grp", `<td colspan="3">${rows[++i]}</td>`)); continue; }
    tb.append(el("tr", null, rows[i].map(c => `<td>${c || ""}</td>`).join("")));
  }
  s.append(tw); p.append(s);
}

/* ---------- live state ---------- */
function bar(host, segs) { host.textContent = ""; segs.forEach(([color, n]) => { if (!n) return; const d = el("div"); d.style.flex = String(n); d.style.background = color; host.append(d); }); }
function legend(host, items) { host.innerHTML = items.map(([color, n, t]) => `<span><i style="background:${color}"></i><b>${n}</b> ${t}</span>`).join(""); }
function chunkChip(id, withSystem) {
  const c = CBY[id], open = openOf(c.waits);
  const a = el("a", "st" + (open.length ? " open" : "")); a.href = "#bk-" + id; a.style.cssText = tint(sysColor(c.by));
  a.textContent = `${id} ${txt(c.n)}` + (withSystem && multiSys && c.by !== accent.key && SYS[c.by] ? ` (${SYS[c.by].name})` : "") + (open.length ? ` · waits on ${open.map(qn).join(", ")}` : "");
  return a;
}
function paintChunks() {
  CH.forEach(c => {
    const root = document.getElementById("bk-" + c.id); if (!root) return;
    const waits = c.waits || [], open = openOf(waits);
    part(root, "gist").innerHTML = !waits.length ? `<span class="ok">Ready</span>, nothing to decide`
      : open.length ? `<span class="w">Waits on</span> ${open.map(qn).join(", ")}` : `<span class="ok">Ready</span>, ${waits.map(qn).join(", ")} decided`;
    const r = part(root, "refs"); r.textContent = "";
    if (!waits.length) r.append(el("span", "chip ok", "nothing to decide"));
    waits.forEach(w => { const a = el("a", "chip " + (isDone(w) ? "ok" : "w"), (isDone(w) ? "✓ " : "") + esc(qn(w))); a.href = "#q-" + w; a.title = QBY[w] ? txt(QBY[w].t) : w; r.append(a); });
    (c.refs || []).forEach(x => r.append(el("span", "chip", x)));
  });
}
function paintStats() {
  const done = Q.filter(q => isDone(q.id)).length;
  const openSide = k => Q.filter(q => q.side === k && !isDone(q.id)).length;
  $("#qsum-title").textContent = `${done} of ${Q.length} questions decided`;
  const qsegs = [["var(--ok)", done, "decided"], ...SIDES.map(x => [`var(--c-${x.color})`, openSide(x.key), multiSide ? `open for ${x.name.toLowerCase()}` : "open"])];
  bar($("#qsum-bar"), qsegs); legend($("#qsum-legend"), qsegs);
  if (CH.length) {
    const waiting = CH.filter(c => openOf(c.waits).length).length;
    const ready = k => CH.filter(c => c.by === k && !openOf(c.waits).length).length;
    $("#csum-title").textContent = `${CH.length} build chunks · ${days(sum(CH)).replace(" d", "")} engineer-days`;
    const csegs = [...SYSTEMS.map(x => [`var(--c-${x.color})`, ready(x.key), multiSys ? `${x.name}, ready` : "ready"]), ["var(--warn)", waiting, "waiting on a question"]];
    bar($("#csum-bar"), csegs); legend($("#csum-legend"), csegs.filter(x => x[1]));
  }
  const m = $("#matrix");
  if (m) {
    m.textContent = "";
    D.items.forEach(([id, what, ids]) => {
      const row = el("div", "mrow", `<div class="who"><span class="id">${esc(id)}</span><b>${what}</b></div>`), ch = el("div", "chips");
      ids.forEach(c => ch.append(chunkChip(c, false))); row.append(ch); m.append(row);
    });
  }
  ((F.order && F.order.phases) || []).forEach((x, i) => {
    const h = document.querySelector(`[data-phase="${i}"]`); if (!h) return;
    h.textContent = ""; phaseChunks(x).forEach(c => h.append(chunkChip(c, true)));
  });
  const ol = $("#olist"); ol.textContent = "";
  const openQs = Q.filter(q => !isDone(q.id));
  if (!openQs.length) ol.append(el("div", "oi", `<span class="tag" style="--c:var(--ok)">Done</span><p>Every question has a recorded decision.</p>`));
  openQs.forEach(q => {
    const blocks = blocksOf(q.id), after = openOf(q.needs), side = SIDE[q.side];
    const notes = [CH.length ? (blocks.length ? `Holds up ${blocks.join(", ")}.` : "Holds up no build chunk.") : "", after.length ? `Decide after ${after.map(qn).join(", ")}.` : "", `Recommended: ${esc(optLabel(q, q.rec))}.`].filter(Boolean).join(" ");
    const div = el("div", "oi", `<span class="tag">${esc(side.name)}</span><p>${q.t}<a class="dref" href="#q-${q.id}">${esc(q.n)}</a> <small>${notes}</small></p>`);
    div.querySelector(".tag").style.cssText = tint(side.color); ol.append(div);
  });
  $("#n-decisions").textContent = `${done}/${Q.length}`;
  $("#n-open").textContent = String(openQs.length);
}
function repaintAll() { Q.forEach(paintQuestion); paintChunks(); paintStats(); applyFilter(); }

/* ---------- saved decisions ---------- */
async function record(q) {
  const root = document.getElementById("q-" + q.id), ta = part(root, "note");
  const opt = pick[q.id] || (isDone(q.id) ? decisions[q.id].opt : q.rec);
  await write(q, { state: "decided", opt, note: ta.value.trim().slice(0, 500) });
  ta.value = ""; delete pick[q.id];
}
async function reopenQ(q) {
  const ta = part(document.getElementById("q-" + q.id), "note");
  await write(q, { state: "open", opt: null, note: ta.value.trim().slice(0, 500) });
  ta.value = ""; delete pick[q.id];
}
async function write(q, entry) {
  const msg = part(document.getElementById("q-" + q.id), "msg"); msg.textContent = "";
  if (!store || !myId) return;
  const cur = decisions[q.id];
  const history = (cur ? [...(cur.history || []), { state: cur.state, opt: cur.opt, note: cur.note || "", by: cur.by, at: cur.at }] : []).slice(-20);
  try {
    await store.doc("decisions/" + q.id).set({ ...entry, by: myId, at: new Date().toISOString(), history });
  } catch (e) {
    if (e && e.code === "invalid_argument") { writable = false; msg.textContent = "You can read decisions but not record them on this page."; repaintAll(); }
    else if (e && e.code === "unavailable") msg.textContent = "Not saved: the page lost its connection. Try again.";
    else msg.textContent = "Not saved. Try again in a moment.";
  }
}
async function connect() {
  const sync = $("#sync"), use = window.claude && window.claude.use;
  if (!use) { sync.textContent = "Open this page in Claude to see and record decisions."; return; }
  const [db, user] = await Promise.all([use("db"), use("user")]);
  userNs = user;
  if (!db) { sync.textContent = "Sign in to see and record decisions."; return; }
  store = db;
  myId = user ? await user.id() : null;
  if (user && await user.can("data.write") === false) writable = false;
  const timer = setTimeout(() => { sync.textContent = "Saved decisions can't be reached yet."; }, 10000);
  db.collection("decisions").onSnapshot(snap => {
    snap.docs.forEach(doc => { if (QBY[doc.id]) decisions[doc.id] = doc.data(); });
    snap.docChanges().forEach(ch => { if (ch.type === "removed") delete decisions[ch.doc.id]; });
    if (!snap.metadata.fromCache) { clearTimeout(timer); sync.textContent = writable ? "Decisions are saved for everyone." : "You can read decisions; recording needs Contributor access."; }
    repaintAll();
  }, err => { clearTimeout(timer); sync.textContent = err && err.code === "revoked" ? "Saved decisions are no longer available here." : "Saved decisions can't be loaded."; });
  repaintAll();
}

/* ---------- tabs (hash routing) ---------- */
function show(tab) {
  TAB_KEYS.forEach(t => { panels[t].hidden = t !== tab; });
  document.querySelectorAll("[data-tablink]").forEach(a => { if (a.dataset.tablink === tab) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
}
function route() {
  const h = decodeURIComponent(location.hash.slice(1));
  let tab = TAB_KEYS.includes(h) ? h : null, target = null;
  if (!tab && h) {
    target = document.getElementById(h);
    const p = target && target.closest("[data-tab]");
    if (p) tab = p.dataset.tab; else target = null;
  }
  show(tab || "overview");
  if (target) {
    if (target.hidden) { filter = "all"; applyFilter(); }
    const det = target.closest("details.cx"); if (det) det.open = true;
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  } else if (h) window.scrollTo(0, 0);
}

/* ---------- start ---------- */
main.textContent = "";
buildNav();
const RENDER = { overview: renderOverview, decisions: renderDecisions, api: renderApi, data: renderData, tasks: renderTasks, order: renderOrder, open: renderOpen, facts: renderFacts, glossary: renderGlossary };
TABS.forEach(([k]) => {
  const p = el("div", "panel"); p.dataset.tab = k; p.id = "p-" + k; p.hidden = true;
  const builtIn = RENDER[k];
  if (builtIn && (k === "overview" || k === "decisions" || k === "open" || TABS.find(t => t[0] === k)[2])) builtIn(p);
  RAW.filter(r => r.tab === k).forEach(r => { const s = section(r.title, r.sub, r.id); s.insertAdjacentHTML("beforeend", r.html || ""); p.append(s); });
  panels[k] = p; main.append(p);
});
main.append(el("footer", null, "Decisions are saved with this page and shown to everyone who opens it. Only names and times are shown; nothing else about you is stored."));
const counts = { api: F.api && F.api.items && F.api.items.length, data: F.data && F.data.items && F.data.items.length, tasks: CH.length };
Object.entries(counts).forEach(([k, n]) => { const s = document.getElementById("n-" + k); if (s && n) s.textContent = String(n); });
repaintAll();
connect();
window.addEventListener("hashchange", route);
route();
})();
