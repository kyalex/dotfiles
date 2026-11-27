# data.js format

`data.js` sets one object, `window.FEATURE`. `app.js` draws the page from it; `scripts/fd.mjs check` validates it.

- Prose fields (`lede`, `meta`, `ctx`, labels, notes, cells, glossary text) are HTML: `<code>`, `<b>`, `<a href target="_blank" rel="noopener">`. Escape a literal `<` as `&lt;`.
- Code samples (`api` `before`/`after`, `data` `code`) are plain text in template strings. A line starting `##` is highlighted as new (the `##` is dropped); text after `//` shows muted.
- Colours come from the palette: `blue`, `amber`, `purple`, `teal`, `rose`, `slate`. Green, yellow and red are reserved for decided, waiting and risk.
- A tab without data is hidden: only Overview, Decisions and Open items always show.

## Annotated skeleton

```js
window.FEATURE = {
  title: "Notification Preferences in Notify", // h1 and page title, plain text
  brand: "Preferences in Notify",             // nav bar label; defaults to title
  lede: "One preferences service in Notify serves …",
  meta: "Code read at App <code>1a2b3c4d5e</code> and Notify <code>6f7a8b9c0d</code>. Sizes are engineer-day ranges, not commitments.",
  accent: "notify",                           // system whose colour marks ids, buttons, new lines; defaults to the last system

  systems: [                                  // 1..n; a chunk's colour is always the colour of the system that builds it
    { key: "app", name: "App", long: "Main application", color: "blue" },
    { key: "notify", name: "Notify", color: "amber" }
  ],
  sides: [                                    // deciding groups; every question has exactly one owner
    { key: "product", name: "Product", color: "purple" },
    { key: "backend", name: "Backend", color: "blue" }   // optional title: "Backend decides"
  ],

  agreed: [["Home: Notify, preferences in Postgres", "notify"], ["App keeps sign-in and accounts", "app"]],   // [html, systemKey?]
  sources: ["<a href=\"https://…\" target=\"_blank\" rel=\"noopener\">Notifications plan</a>: preferences spec v2."],
  map: {                                      // optional who-reads-and-writes map on Overview
    title: "Who reads and writes preferences", sub: "…",
    left:  { label: "Callers", nodes: [["Web client", "own preferences, edit"], ["App: email jobs", "batch read, 5-minute cache", "app"]] },
    core:  { system: "notify", label: "Notify", title: "Preferences service", nodes: [["preferences", "Postgres, one row per user and channel"]] },
    right: { label: "Reads from, writes to", nodes: [["Audit log", "preference changes (DEP-2)"]] }
  },                                          // node: [title, small, systemKey?]

  decisions: { sub: "…" },                    // optional intro override for the Decisions tab
  questions: [{
    id: "quiet-hours",                        // stable slug: DOM id and the saved decision's key. Never rename it.
    n: "PQ-4",                                // display id; renumbering is safe
    side: "product",
    t: "Quiet hours and who enforces them",
    ctx: "Facts from the code and sources, with <code>names</code>.",
    refs: ["REQ-4", "ADR-2"],                 // free-text chips
    needs: ["user-key"],                      // questions to decide first; drives the grilling order
    opts: [["a", "Client hides alerts; Notify stores the hours", "What this option costs or implies."],
           ["b", "Notify holds sends until quiet hours end", "…"]],
    rec: "a",
    why: "Why the recommendation wins."
  }],                                         // "blocks" is derived from chunk waits; never write it

  tasks: { title: "What Notify and App build", sub: "…", note: "Client work is not counted here." },
  lanes: [{ key: "port", name: "Port", title: "Port: today's preferences move to Notify" },
          { key: "new", name: "New", title: "New: what the spec adds" }],   // headings for chunks
  chunks: [{
    id: "N1", lane: "new", by: "notify", n: "Quiet hours",
    s: [1, 2],                                // engineer-day range, 0.5 steps allowed
    waits: ["quiet-hours", "schemas"],        // question slugs; the chunk is ready when all are decided
    p: "What gets built.", refs: ["REQ-4"]
  }],
  deliverables: {                             // what a consumer gets, and the chunks it needs (Overview matrix + Tasks table)
    name: "client task", what: "What the user gets", sub: "…",     // optional names: plural when not name + "s"
    items: [["UI-1", "Preferences screen", ["P1", "N1"]]]
  },

  api: { title: "API: same paths, new fields", sub: "…", from: "app", to: "notify",
    items: [{ p: "PUT /api/v1/preferences", d: "Edit", before: `…`, after: `…\n##  "quiet_hours": "22:00-07:00"` }] },
    // item: id?, from?, to?; no `before` means a new endpoint
  data: { title: "Data and settings", sub: "…",
    items: [{ id: "db-preferences", name: "preferences", store: "Postgres, one row per user and channel", gist: "One line shown while collapsed.", code: `{ … }` }] },

  order: { title: "Build order", sub: "…",
    phases: [{ k: "Phase 1", t: "Port as-is", lead: "…", lane: "port" },           // chips from a lane …
             { t: "Quiet hours on top", chunks: ["N1", "N2"] },                    // … or listed chunks
             { t: "When the audit log lands", items: [["Change history", "Audit log (DEP-2)."]] }],   // items only: dashed "later" card
    deps: { title: "What preferences depend on", sub: "…", rows: [["Audit log", "DEP-2", "change history", "History stays empty"]] } },
    // deps columns: Needs, From, Used for, Until it exists

  gaps: { title: "Spec requirements no task covers yet", sub: "The {n} lines …", cols: ["Spec", "Requirement", "Lands in"], id: "spec",
    rows: [["REQ-3", "New users get default preferences", "P7 (PQ-3)"]] },   // {n} becomes the row count

  facts: { sub: "…", groups: [{ system: "app", items: [["Statement of what the code does.", "src/mailer/x.ts · y.ts:185"]] }] },
  glossary: { sub: "…", groups: [{ name: "Users and ids", terms: [["<code>user_id</code>", "Meaning.", "<a href=\"#q-user-key\">BQ-1</a>"]] }] },

  sections: [{ tab: "overview", id: "flows", title: "Request flow", sub: "…", html: "<figure>…</figure>" }]   // raw HTML for one-off content
};
```

## Links inside the page

Any `href="#<id>"` opens the right tab, expands the card and scrolls to it: `#q-<slug>` a question, `#bk-<chunk id>` a chunk, a data or API item's `id`, a section's `id`, or a tab name (`#decisions`, `#tasks`).
