#!/usr/bin/env node
// node fd.mjs check <data.js>                    validate the data file; exit 1 on any error
// node fd.mjs open  <data.js> [<decisions dir>]  open questions as Markdown, ready ones first
//   <decisions dir> holds one <slug>.json per saved decision (ArtifactData list with out_dir writes <out_dir>/decisions/).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";

const [cmd, file, decDir] = process.argv.slice(2);
if (!["check", "open"].includes(cmd) || !file) { console.error("usage: fd.mjs check|open <data.js> [<decisions dir>]"); process.exit(2); }

function load(path) {
  const sandbox = { window: {} };
  try { vm.runInNewContext(readFileSync(path, "utf8"), sandbox, { filename: path }); }
  catch (e) { console.error(`${path}: ${e.message}`); process.exit(1); }
  if (!sandbox.window.FEATURE) { console.error(`${path}: does not set window.FEATURE`); process.exit(1); }
  return sandbox.window.FEATURE;
}

const F = load(file);
const errors = [];
const err = m => errors.push(m);
const arr = x => Array.isArray(x) ? x : [];
const PALETTE = ["blue", "amber", "purple", "teal", "rose", "slate"];
const TABS = ["overview", "decisions", "api", "data", "tasks", "order", "open", "facts", "glossary"];
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

function keyed(list, what, extra) {
  const seen = new Set();
  arr(list).forEach((x, i) => {
    if (!x || !x.key) return err(`${what}[${i}] has no key`);
    if (seen.has(x.key)) err(`${what} key "${x.key}" is used twice`);
    seen.add(x.key);
    if (extra) extra(x);
  });
  return seen;
}

if (!F.title || /[<>]/.test(F.title)) err("title is missing or contains markup");
if (!arr(F.systems).length) err("systems: at least one is required");
const sys = keyed(F.systems, "systems", s => { if (!s.name) err(`system "${s.key}" has no name`); if (!PALETTE.includes(s.color)) err(`system "${s.key}" color must be one of ${PALETTE.join(", ")}`); });
if (!arr(F.sides).length) err("sides: at least one is required");
const sides = keyed(F.sides, "sides", s => { if (!s.name) err(`side "${s.key}" has no name`); if (!PALETTE.includes(s.color)) err(`side "${s.key}" color must be one of ${PALETTE.join(", ")}`); if (["all", "open", "done"].includes(s.key)) err(`side key "${s.key}" is reserved`); });
const lanes = keyed(F.lanes, "lanes", l => { if (!l.name) err(`lane "${l.key}" has no name`); });
const hasSys = (k, where) => { if (k != null && !sys.has(k)) err(`${where}: unknown system "${k}"`); };
if (F.accent != null) hasSys(F.accent, "accent");
arr(F.agreed).forEach((a, i) => { if (!Array.isArray(a) || !a[0]) err(`agreed[${i}] must be [html, systemKey?]`); else hasSys(a[1], `agreed[${i}]`); });

const Q = arr(F.questions), QBY = {};
const ns = new Set();
Q.forEach((q, i) => {
  const at = `question ${q.id || "#" + i}`;
  if (!q.id || !SLUG.test(q.id)) err(`${at}: id must be a lowercase slug`);
  if (QBY[q.id]) err(`${at}: id is used twice`);
  QBY[q.id] = q;
  if (!q.n) err(`${at}: no display id (n)`); else if (ns.has(q.n)) err(`${at}: display id ${q.n} is used twice`); else ns.add(q.n);
  if (!q.t) err(`${at}: no title (t)`);
  if (!sides.has(q.side)) err(`${at}: unknown side "${q.side}"`);
  const keys = arr(q.opts).map(o => Array.isArray(o) ? o[0] : undefined);
  if (keys.length < 2) err(`${at}: needs at least two options`);
  if (keys.some(k => !k) || new Set(keys).size !== keys.length) err(`${at}: option keys must be present and unique`);
  if (!keys.includes(q.rec)) err(`${at}: rec "${q.rec}" is not one of its options`);
  if ("blocks" in q) err(`${at}: drop "blocks"; it is derived from chunk waits`);
});
Q.forEach(q => arr(q.needs).forEach(w => { if (!QBY[w]) err(`question ${q.id}: needs unknown question "${w}"`); if (w === q.id) err(`question ${q.id}: needs itself`); }));
const state = {};
const cyc = id => { if (state[id] === 1) return true; if (state[id] === 2 || !QBY[id]) return false; state[id] = 1; const r = arr(QBY[id].needs).some(cyc); state[id] = 2; return r; };
Q.forEach(q => { if (cyc(q.id)) err(`question ${q.id}: needs forms a cycle`); });

const CH = arr(F.chunks), CBY = {};
if (CH.length && !lanes.size) err("chunks need at least one lane");
CH.forEach((c, i) => {
  const at = `chunk ${c.id || "#" + i}`;
  if (!c.id || /\s/.test(c.id)) err(`${at}: id is missing or has spaces`);
  if (CBY[c.id]) err(`${at}: id is used twice`);
  CBY[c.id] = c;
  if (!c.n) err(`${at}: no name (n)`);
  if (!lanes.has(c.lane)) err(`${at}: unknown lane "${c.lane}"`);
  if (!sys.has(c.by)) err(`${at}: unknown system "${c.by}" in by`);
  if (!Array.isArray(c.s) || c.s.length !== 2 || c.s.some(n => typeof n !== "number") || c.s[0] > c.s[1]) err(`${at}: s must be [lo, hi] engineer-days`);
  arr(c.waits).forEach(w => { if (!QBY[w]) err(`${at}: waits on unknown question "${w}"`); });
});
const hasChunk = (id, where) => { if (!CBY[id]) err(`${where}: unknown chunk "${id}"`); };
if (F.deliverables) {
  if (!F.deliverables.name) err("deliverables: name is required");
  arr(F.deliverables.items).forEach(d => arr(d[2]).forEach(c => hasChunk(c, `deliverable ${d[0]}`)));
}
arr(F.order && F.order.phases).forEach((p, i) => {
  if (!p.t) err(`order.phases[${i}]: no title (t)`);
  if (p.lane && !lanes.has(p.lane)) err(`order.phases[${i}]: unknown lane "${p.lane}"`);
  arr(p.chunks).forEach(c => hasChunk(c, `order.phases[${i}]`));
});
if (F.api) { hasSys(F.api.from, "api.from"); hasSys(F.api.to, "api.to"); arr(F.api.items).forEach((a, i) => { if (!a.p || !a.after) err(`api.items[${i}]: p and after are required`); hasSys(a.from, `api.items[${i}].from`); hasSys(a.to, `api.items[${i}].to`); }); }
arr(F.data && F.data.items).forEach((m, i) => { if (!m.name || !m.code) err(`data.items[${i}]: name and code are required`); });
arr(F.facts && F.facts.groups).forEach((g, i) => { hasSys(g.system, `facts.groups[${i}]`); if (!g.title && !g.system) err(`facts.groups[${i}]: system or title is required`); });
if (F.map) {
  if (!F.map.left || !F.map.core || !F.map.right) err("map: left, core and right are required");
  else { hasSys(F.map.core.system, "map.core"); [F.map.left, F.map.core, F.map.right].forEach(c => arr(c.nodes).forEach(n => hasSys(n[2], "map node"))); }
}
arr(F.sections).forEach((s, i) => { if (!TABS.includes(s.tab)) err(`sections[${i}]: tab must be one of ${TABS.join(", ")}`); if (!s.html) err(`sections[${i}]: html is required`); });
const ids = [...arr(F.api && F.api.items), ...arr(F.data && F.data.items), ...arr(F.sections)].map(x => x.id).filter(Boolean);
ids.forEach((id, i) => { if (ids.indexOf(id) !== i) err(`element id "${id}" is used twice`); if (/^(q|bk|p|n|h|lane)-/.test(id) || TABS.includes(id)) err(`element id "${id}" clashes with the page's own ids`); });

if (errors.length) { console.error(errors.map(e => "✗ " + e).join("\n")); console.error(`${errors.length} problem(s) in ${file}`); process.exit(1); }

if (cmd === "check") {
  console.log(`OK: ${Q.length} questions, ${CH.length} chunks, ${arr(F.systems).length} system(s), ${arr(F.sides).length} deciding group(s)`);
  process.exit(0);
}

// open
const dec = {};
if (decDir && existsSync(decDir)) for (const f of readdirSync(decDir).filter(f => f.endsWith(".json"))) {
  const doc = JSON.parse(readFileSync(join(decDir, f), "utf8"));
  dec[f.slice(0, -5)] = doc.data && doc.data.state ? doc.data : doc;
}
const done = id => dec[id] && dec[id].state === "decided";
const plain = s => String(s || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const blocks = id => CH.filter(c => arr(c.waits).includes(id)).map(c => c.id);
const open = Q.filter(q => !done(q.id));
const ready = open.filter(q => arr(q.needs).every(done)), later = open.filter(q => !ready.includes(q));
const side = k => (arr(F.sides).find(s => s.key === k) || {}).name || k;
const out = [`# ${F.title}: open questions`, "", `${Q.length - open.length} of ${Q.length} decided. ${ready.length} ready to ask, ${later.length} waiting on another question.`];
const ignored = Object.keys(dec).filter(k => !QBY[k]);
if (ignored.length) out.push("", `Saved records with no matching question (ignored by the page): ${ignored.join(", ")}`);
const card = q => {
  out.push("", `## ${q.n} · ${plain(q.t)}`, "", `slug \`${q.id}\` · ${side(q.side)} decides` + (blocks(q.id).length ? ` · blocks ${blocks(q.id).join(", ")}` : "") + (arr(q.needs).length ? ` · after ${q.needs.map(w => QBY[w].n + (done(w) ? " ✓" : "")).join(", ")}` : ""));
  if (dec[q.id] && dec[q.id].state === "open") out.push("", `Reopened${dec[q.id].note ? ": " + dec[q.id].note : ""}`);
  if (q.ctx) out.push("", plain(q.ctx));
  out.push("");
  q.opts.forEach(([k, label, note]) => out.push(`- **${k}** ${plain(label)}${k === q.rec ? " (recommended)" : ""}${note ? ": " + plain(note) : ""}`));
  if (q.why) out.push("", `Why recommended: ${plain(q.why)}`);
};
if (ready.length) { out.push("", "---", "", "# Ready to ask"); ready.forEach(card); }
if (later.length) { out.push("", "---", "", "# Waiting on another question"); later.forEach(card); }
console.log(out.join("\n"));
