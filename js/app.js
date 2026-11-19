"use strict";
/* NoteTip core: storage, library, notebooks, editor, AI, overview, quiz. */
const I = {
  sidebar:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  folder:'<svg viewBox="0 0 24 24"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z"/></svg>',
  book:'<svg viewBox="0 0 24 24"><path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18M10 7h5"/></svg>',
  home:'<svg viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
  gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  spark:'<svg viewBox="0 0 24 24"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
  close:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chevR:'<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>',
  chevL:'<svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg>',
  more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
  trash:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  pencil:'<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
  move:'<svg viewBox="0 0 24 24"><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z"/><path d="M10 13.5h6m-2.5-2.5 2.5 2.5-2.5 2.5"/></svg>',
  notes:'<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h3"/></svg>',
  overview:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="4" rx="1.5"/><rect x="13" y="10" width="7" height="10" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/></svg>',
  quiz:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.2v.1"/></svg>',
  send:'<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
  stop:'<svg viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  open:'<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  refresh:'<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 2M9.5 2.5h5"/></svg>',
  download:'<svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  print:'<svg viewBox="0 0 24 24"><path d="M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2"/><rect x="7" y="14" width="10" height="6"/></svg>',
  upload:'<svg viewBox="0 0 24 24"><path d="M12 16V5M7 10l5-5 5 5M5 20h14"/></svg>',
  speaker:'<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
  eye:'<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  people:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/></svg>',
  link:'<svg viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>',
  copy:'<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  video:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3z"/></svg>',
  sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  slides:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 16v4M8 20h8M7 8h6M7 11h9"/></svg>'
};
const ic = (n, cls='') => `<span class="ic ${cls}">${I[n]}</span>`;

/* ---------- utils ---------- */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => (Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 10)).replace(/[^a-z0-9]/g,'');
const COVERS = ['#2747A8','#1F7A5C','#B2452F','#6B4BA6','#C08A1E','#2C7C9C','#9C2F5C','#3D4454'];
const PAPER_COLORS = [['auto','Match theme'],['white','White'],['ivory','Ivory'],['sky','Sky'],['mint','Mint'],['night','Night']];
const PAPER_TYPES = [['lined','Lined'],['college','College ruled'],['graph','Graph'],['dotted','Dotted'],['blank','Blank']];
function LSO(){ return window.NTStorage || localStorage }
function lsGet(k){ try { return LSO().getItem(k) } catch { return null } }
function lsSet(k, v){ try { LSO().setItem(k, v); return true } catch { return false } }
function lsDel(k){ try { LSO().removeItem(k) } catch {} }
function ago(t){
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60) + ' min ago';
  if (s < 86400) return Math.floor(s/3600) + ' h ago';
  if (s < 86400*7) return Math.floor(s/86400) + ' d ago';
  return new Date(t).toLocaleDateString(undefined, {month:'short', day:'numeric'});
}
function toast(msg){
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; t.setAttribute('role','status');
  document.body.appendChild(t); setTimeout(() => t.remove(), 3800);
}
/* stored data can arrive frozen, so always work on a copy */
function dataOf(doc){ const v = doc && doc.data ? doc.data() : null; return v == null ? v : JSON.parse(JSON.stringify(v)) }
function withTimeout(p, ms){ return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]) }
function shuffle(a){ a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

/* ---------- state ---------- */
const S = {
  items: new Map(), ink: new Map(), mode:'local', sample:null, downloads:null,
  view:{name:'home', folderId:null}, tab:'notes', page:0,
  sbOpen: lsGet('inkwell.sb') !== '0' && window.innerWidth >= 1000,
  expanded: new Set(JSON.parse(lsGet('inkwell.exp') || '[]')),
  aiOpen:false, query:'', sort: lsGet('inkwell.sort') || 'recent',
  saveErr:false, quizRun:null, aiBusy:{}, popOpen:false, viewMode:false
};
const folders = () => [...S.items.values()].filter(x => x.type === 'folder');
const notebooks = () => [...S.items.values()].filter(x => x.type === 'notebook' && !x.shared);
const sharedNbs = () => [...S.items.values()].filter(x => x.type === 'notebook' && x.shared).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
const sharedByMe = () => sharedNbs().filter(n => Share.isOwner(n));
const sharedWithMe = () => sharedNbs().filter(n => !Share.isOwner(n));
const childrenOf = pid => [...S.items.values()].filter(x => !x.shared && (x.parentId || null) === (pid || null));
function pathOf(id){ const out = []; let cur = S.items.get(id); let guard = 0; while (cur && cur.parentId && guard++ < 50){ cur = S.items.get(cur.parentId); if (cur) out.unshift(cur) } return out }
function descCount(fid){ let n = 0; childrenOf(fid).forEach(c => { if (c.type === 'notebook') n++; else n += descCount(c.id) }); return n }
function isDescendant(id, ancestorId){ let cur = S.items.get(id); let g = 0; while (cur && g++ < 50){ if (cur.parentId === ancestorId) return true; cur = S.items.get(cur.parentId) } return false }
const inkCount = nb => nb.pages.reduce((n, p) => n + (S.ink.get(nb.id + '_' + p.id) || []).length, 0);

/* ---------- storage ---------- */
const LS_KEY = 'inkwell.data.v1', LS_INK = 'inkwell.ink.';
const Store = {
  col:null, timers:new Map(), inflight:new Map(), dirty:new Set(), warned:false,
  async init(){
    let db = null, user = null;
    try { if (window.claude && window.claude.use) [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]) } catch {}
    if (db && user){
      try {
        const id = await user.id();
        if (id){
          this.col = db.collection('data/users/' + id); this.db = db; this.uid = id;
          const snap = await withTimeout(this.col.limit(1000).get(), 10000);
          S.mode = 'cloud';
          const items = [], ink = []; let meta = null;
          snap.docs.forEach(d => { const v = dataOf(d); if (!v) return; if (d.id === 'meta') meta = v; else if (d.id.startsWith('it_')) items.push(v); else if (d.id.startsWith('ink_')) ink.push([d.id.slice(4), v.s || []]) });
          return {items, ink, seeded: !!(meta && meta.seeded)};
        }
      } catch (e){ console.warn('Cloud storage unavailable, using this device', e); this.col = null }
    }
    S.mode = 'local';
    let data = null; try { data = JSON.parse(lsGet(LS_KEY) || 'null') } catch {}
    const ink = [];
    try { const L = LSO(); for (let i = 0; i < L.length; i++){ const k = L.key(i); if (k && k.startsWith(LS_INK)) ink.push([k.slice(LS_INK.length), JSON.parse(lsGet(k) || '[]')]) } } catch {}
    return {items: (data && data.items) || [], ink, seeded: !!(data && data.seeded)};
  },
  schedule(docId, delay){ clearTimeout(this.timers.get(docId)); this.timers.set(docId, setTimeout(() => this.flush(docId), delay)); updateSaveState() },
  put(item, delay = 700){ item.updatedAt = Date.now(); S.items.set(item.id, item); if (item.type === 'notebook' && typeof Versions !== 'undefined') Versions.touch(item); if (item.shared) return Share.write(item, Math.min(delay, 350)); this.schedule('it_' + item.id, delay) },
  putInk(key, strokes, delay = 900){ S.ink.set(key, strokes); const nb = S.items.get(key.split('_')[0]); if (nb && nb.shared) return Share.writeInk(nb, key.slice(nb.id.length + 1), 250); this.schedule('ink_' + key, delay) },
  remove(id){ const it = S.items.get(id); S.items.delete(id); if (it && it.shared){ Share.destroyRemote(it); return } this.schedule('it_' + id, 0) },
  removeInk(key){ const nb = S.items.get(key.split('_')[0]); S.ink.delete(key); if (nb && nb.shared){ Share.write(nb, 100); return } this.schedule('ink_' + key, 0) },
  dropPrivate(docIds){
    docIds.forEach(id => { clearTimeout(this.timers.get(id)); this.timers.delete(id) });
    if (S.mode === 'cloud') docIds.forEach(id => this.col.doc(id).delete().catch(() => {}));
    else { lsSet(LS_KEY, JSON.stringify({seeded:true, items:[...S.items.values()].filter(x => !x.shared)})); docIds.filter(id => id.startsWith('ink_')).forEach(id => lsDel(LS_INK + id.slice(4))) }
    updateSaveState();
  },
  dataFor(docId){
    if (docId.startsWith('it_')){ const it = S.items.get(docId.slice(3)); return it && !it.shared ? it : undefined }
    const s = S.ink.get(docId.slice(4)); return s ? {s} : undefined;
  },
  flush(docId){
    clearTimeout(this.timers.get(docId)); this.timers.delete(docId);
    const data = this.dataFor(docId);
    if (data){ const size = JSON.stringify(data).length; if (size > 240000 && !this.warned){ this.warned = true; toast('This page is getting very large and may stop saving. Start a new page for more ink.') } }
    if (S.mode === 'local'){
      let ok;
      if (docId.startsWith('it_')) ok = lsSet(LS_KEY, JSON.stringify({seeded:true, items:[...S.items.values()].filter(x => !x.shared)}));
      else if (data) ok = lsSet(LS_INK + docId.slice(4), JSON.stringify(data.s)); else { lsDel(LS_INK + docId.slice(4)); ok = true }
      S.saveErr = !ok; if (!ok) toast("This browser's storage is full, so the latest change wasn't saved.");
      updateSaveState(); return;
    }
    if (this.inflight.has(docId)){ this.dirty.add(docId); return }
    const ref = this.col.doc(docId);
    const p = data ? ref.set(JSON.parse(JSON.stringify(data))) : ref.delete();
    this.inflight.set(docId, p); updateSaveState();
    p.then(() => { S.saveErr = false }).catch(e => { console.warn(e); S.saveErr = true; toast("Couldn't save your latest change. Keep this page open and edit again to retry.") })
     .finally(() => { this.inflight.delete(docId); updateSaveState(); if (this.dirty.delete(docId)) this.flush(docId) });
  },
  flushAll(){ [...this.timers.keys()].forEach(id => this.flush(id)) },
  markSeeded(){ if (S.mode === 'cloud') this.col.doc('meta').set({seeded:true}).catch(() => {}); else lsSet(LS_KEY, JSON.stringify({seeded:true, items:[...S.items.values()]})) }
};
window.addEventListener('pagehide', () => Store.flushAll());
document.addEventListener('visibilitychange', () => { if (document.hidden) Store.flushAll() });
function updateSaveState(){
  const el = $('#savestate'); if (!el) return;
  const busy = Store.timers.size + Store.inflight.size + (typeof Share !== 'undefined' ? Share.busy() : 0);
  const nb = curNb();
  el.textContent = busy ? 'Saving…' : S.saveErr ? 'Not saved' : nb && nb.shared ? 'Synced' : S.mode === 'cloud' ? 'Saved' : 'Saved on this device';
  el.classList.toggle('warn', S.saveErr);
}

/* ---------- starter content ---------- */
function makeNotebook(o){
  return Object.assign({id:uid(), type:'notebook', name:'Untitled notebook', parentId:null, cover:COVERS[0], createdAt:Date.now(), updatedAt:Date.now(),
    settings:{paper:'lined', color:'auto', spacing:'medium', font:'hand', math:true, answers:true, angles:'deg', colors:true},
    pages:[{id:uid(), text:'', voice:[]}], chat:[], overview:null, quiz:null, quizHistory:[]}, o);
}
function seed(){
  const now = Date.now();
  const math = {id:uid(), type:'folder', name:'Math', parentId:null, color:COVERS[0], createdAt:now, updatedAt:now};
  const bio = {id:uid(), type:'folder', name:'Biology', parentId:null, color:COVERS[1], createdAt:now, updatedAt:now};
  const alg = makeNotebook({name:'Algebra: Unit 2', parentId:math.id, cover:COVERS[0], example:true,
    settings:{paper:'graph', color:'auto', spacing:'medium', font:'hand', math:true, answers:true, angles:'deg', colors:true},
    pages:[
      {id:uid(), voice:[], text:`Unit 2: Order of operations
PEMDAS: parentheses, exponents, multiply/divide, add/subtract

Warm-up
12 + 8 × 2 = 28
(15 − 3) ÷ 4 = 3
3² + 4² = 25
7(2 + 3) = 36
9 + × 4 = 13
√144 + 5² =

Solve for x: 2x + 5 = 17
2x = 12
x = 6

Important: whatever you do to one side, do to the other.`},
      {id:uid(), voice:[], text:`Unit 2: Percent and fractions
Definition: Percent — "out of 100"

25% × 80 = 20
3/4 + 1/8 = 0.875
1/3 = 0.33
15% × 60 =

Solve for n: 4n − 7 = 2n + 9
2n = 16
n = 9`}
    ]});
  const calc = makeNotebook({name:'Calculus: Week 5', parentId:math.id, cover:COVERS[3], example:true,
    settings:{paper:'lined', color:'auto', spacing:'medium', font:'hand', math:true, answers:true, angles:'rad', colors:true},
    pages:[{id:uid(), voice:[], text:`# Derivatives and integrals
Formula: power rule d/dx xⁿ = n·xⁿ⁻¹
Main idea: type words like integral, derivative or limit and NoteTip writes the math symbols for you.

d/dx (x³ + 2x) = 3x² + 2
d/dx sin(x²) =
∫₀³ x² dx = 9
∫ 2x dx = x²
∫ cos(x) dx = sin(x) + C
d/dx x⁴ = 4x²
lim x→0 sin(x)/x =
Σ(k=1→10) k² =`}]});
  const cells = makeNotebook({name:'Cell structure', parentId:bio.id, cover:COVERS[1], example:true,
    settings:{paper:'college', color:'auto', spacing:'medium', font:'hand', math:true, answers:true, angles:'deg', colors:true},
    pages:[{id:uid(), voice:[], text:`# Cell structure: parts of a eukaryotic cell
Main idea: every organelle has one job that keeps the cell alive.

Definition: Nucleus — holds the cell's DNA and controls its activities
Definition: Mitochondria — make energy (ATP) through cellular respiration
Definition: Ribosome — builds proteins from amino acids
Definition: Cell membrane — controls what enters and leaves the cell
Definition: Chloroplast — carries out photosynthesis in plant cells
Definition: Cell wall — rigid outer layer that supports plant cells

Example: a leaf cell has chloroplasts; a skin cell doesn't.
Important: prokaryotes (bacteria) have no nucleus.
Question: why do muscle cells have so many mitochondria?

Magnification: eyepiece 10x, objective 40x
10 × 40 = 400`}]});
  const quick = makeNotebook({name:'Quick notes', cover:COVERS[4], example:true,
    settings:{paper:'dotted', color:'auto', spacing:'medium', font:'clean', math:true, answers:true, angles:'deg', colors:true},
    pages:[{id:uid(), voice:[], text:`Things to bring Friday
- lab notebook
- calculator
- signed permission slip

Bus fare for the week: 2.75 × 10 = 27.50`}]});
  [math, bio, alg, calc, cells, quick].forEach(x => { S.items.set(x.id, x); Store.put(x, 50) });
  Store.markSeeded();
  S.expanded.add(math.id); S.expanded.add(bio.id);
}

/* ---------- online version (NoteTip AI through Claude) ---------- */
const ONLINE_URL = 'https://claude.ai/artifact/SGYi3DxfG5tmDZ2u5G5UTs';
const onlineBtn = (label = 'Open NoteTip with Claude AI') => `<a class="btn primary online-btn" href="${ONLINE_URL}" target="_blank" rel="noopener">${ic('spark')}${label}</a>`;
const ONLINE_NOTE = 'NoteTip AI runs on Claude, using your Claude account, in the online version of NoteTip. Sign in to Claude there and the AI works with no key needed. To bring a notebook along, export it here (⋯ → Export → Backup) and restore it there (Home → Import).';

/* ---------- theme ---------- */
const LOGO = 'img/logo-128.png', LOGO_BIG = 'img/logo-256.png';
function themeNow(){ const t = lsGet('notetime.theme') || 'system'; return t === 'light' || t === 'dark' ? t : 'system' }
function isDark(){ const t = themeNow(); return t === 'dark' || (t === 'system' && !!window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) }
function applyTheme(){
  const t = themeNow(), root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
  $$('.theme-btn').forEach(b => { b.innerHTML = isDark() ? I.moon : I.sun; b.title = 'Appearance: ' + ({light:'Light', dark:'Dark', system:'Match system'})[t] });
}
function setTheme(t){ lsSet('notetime.theme', t); applyTheme(); if (S.view.name === 'notebook' && S.tab === 'notes') renderNotes() }
function themeMenu(anchor){ const t = themeNow(); openMenu(anchor, [['light','Light','sun'], ['dark','Dark','moon'], ['system','Match system','gear']].map(([k, l, icn]) => ({icon:icn, label:(t === k ? '✓ ' : '') + l, run:() => setTheme(k)}))) }
const themeBtn = () => `<button class="iconbtn theme-btn" data-theme-btn aria-label="Light or dark mode" title="Light or dark mode">${isDark() ? I.moon : I.sun}</button>`;
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-theme-btn]'); if (b){ e.stopPropagation(); themeMenu(b) } }, true);
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (themeNow() === 'system') applyTheme() }) } catch {}
applyTheme();
const brandTop = () => `<div class="top-brand" aria-hidden="true"><img src="${LOGO}" alt=""><span>NoteTip</span></div>`;
function fitBrand(){
  const tb = $('.topbar'), br = tb && $('.top-brand', tb); if (!br) return;
  br.hidden = false; const r = br.getBoundingClientRect();
  const hit = [...tb.children].some(c => { if (c === br || c.hidden || c.offsetParent === null) return false; if (c.classList.contains('grow')){ c = c.firstElementChild; if (!c) return false } const q = c.getBoundingClientRect(); return q.width > 0 && q.left < r.right + 8 && q.right > r.left - 8 && q.top < r.bottom && q.bottom > r.top });
  br.hidden = hit;
}

/* ---------- routing ---------- */
let hashEcho = null;
function go(hash){
  const h = (hash || '').replace(/^#/, '');
  try { if (location.hash.slice(1) !== h){ hashEcho = h; location.hash = h ? '#' + h : '' } } catch {}
  routeTo(h);
}
function route(){
  const h = location.hash.slice(1);
  if (hashEcho !== null && h === hashEcho){ hashEcho = null; return }
  hashEcho = null;
  routeTo(h);
}
function routeTo(h){
  closeMenus(); closeSheet(); S.popOpen = false;
  let m;
  if ((m = h.match(/^nb-([a-z0-9]+)$/)) && S.items.get(m[1])?.type === 'notebook'){
    if (S.view.name !== 'notebook' || S.view.id !== m[1]){ S.tab = 'notes'; S.page = 0; S.quizRun = null; S.viewMode = false }
    S.view = {name:'notebook', id:m[1]};
    const nb = S.items.get(m[1]); if (nb.shared) Share.open(nb); else Share.close();
  } else if ((m = h.match(/^folder-([a-z0-9]+)$/)) && S.items.get(m[1])?.type === 'folder'){
    S.view = {name:'home', folderId:m[1]};
  } else S.view = {name:'home', folderId:null};
  if (S.view.name !== 'notebook') Share.close();
  if (window.innerWidth < 1000) setSidebar(false, true);
  render();
}
window.addEventListener('hashchange', route);

/* ---------- shell ---------- */
function setSidebar(open, silent){
  S.sbOpen = open; $('#app').classList.toggle('sb-open', open);
  document.documentElement.style.setProperty('--sbw', open && window.innerWidth >= 1000 ? '280px' : '0px');
  if (!silent) lsSet('inkwell.sb', open ? '1' : '0');
  $$('.sb-toggle').forEach(b => { b.classList.toggle('on', open); b.setAttribute('aria-expanded', String(open)) });
  setTimeout(() => { if (S.view.name === 'notebook' && S.tab === 'notes'){ autosize(); Ink.refresh(); scheduleOverlay() } }, 240);
}
$('#scrim').addEventListener('click', () => setSidebar(false));
function sbToggleBtn(){ return `<button class="iconbtn sb-toggle ${S.sbOpen ? 'on' : ''}" aria-label="Show library" aria-expanded="${S.sbOpen}" title="Library">${I.sidebar}</button>` }
function measureTop(){ const tb = $('.topbar'); if (tb){ fitBrand(); document.documentElement.style.setProperty('--tbh', tb.offsetHeight + 'px') } }
function render(){
  Ink.unmount();
  try { renderSidebar() } catch (e){ reportErr(e) }
  try { if (S.view.name === 'notebook') renderNotebook(); else renderHome() }
  catch (e){
    reportErr(e);
    $('#main').innerHTML = `<header class="topbar">${sbToggleBtn()}<div class="grow"></div></header><div class="home"><div class="empty"><b>This page couldn't be shown.</b><span>${esc((e && e.message) || 'Unknown error')}</span><button class="btn primary" id="err-home">Go to Home</button></div></div>`;
    $('#err-home').onclick = () => go('');
  }
  $$('.sb-toggle').forEach(b => b.onclick = () => setSidebar(!S.sbOpen));
  updateSaveState(); measureTop();
}

/* ---------- sidebar ---------- */
function sharedRow(it, activeId){
  const mine = Share.isOwner(it), who = mine ? 'Shared by you' : `Shared by ${Share.ownerName(it.owner) || 'someone else'}`;
  return `<div class="row ${activeId === it.id ? 'active' : ''}" data-go="nb-${it.id}" title="${esc(who)}"><span class="spacer"></span><span class="dot" style="background:${esc(it.cover)}"></span><span class="name">${esc(it.name)}</span><span class="ic shared-ic">${I.people}</span></div>`;
}
function renderSidebar(){
  const sb = $('#sidebar');
  const q = S.query.trim().toLowerCase();
  const activeId = S.view.name === 'notebook' ? S.view.id : S.view.folderId;
  const sortItems = arr => arr.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
  function rowsFor(pid, depth){
    return sortItems(childrenOf(pid)).map(it => {
      const pad = `padding-left:${8 + depth * 16}px`;
      if (it.type === 'folder'){
        const open = S.expanded.has(it.id);
        return `<div class="row ${activeId === it.id ? 'active' : ''}" style="${pad}" data-go="folder-${it.id}" data-drop="${it.id}" draggable="true" data-drag="${it.id}">
          <button class="twist ${open ? 'open' : ''}" data-twist="${it.id}" aria-label="${open ? 'Collapse' : 'Expand'} ${esc(it.name)}">${I.chevR}</button>
          <span class="ic" style="color:${esc(it.color || COVERS[0])}">${I.folder}</span><span class="name">${esc(it.name)}</span><span class="count">${descCount(it.id)}</span></div>` + (open ? rowsFor(it.id, depth + 1) : '');
      }
      return `<div class="row ${activeId === it.id ? 'active' : ''}" style="${pad}" data-go="nb-${it.id}" draggable="true" data-drag="${it.id}">
        <span class="spacer"></span><span class="dot" style="background:${esc(it.cover)}"></span><span class="name">${esc(it.name)}</span></div>`;
    }).join('');
  }
  let tree;
  if (q){
    const hits = [...S.items.values()].filter(x => x.type && (x.type === 'folder' || x.pages) && x.name.toLowerCase().includes(q) || (x.type === 'notebook' && x.pages.some(p => p.text.toLowerCase().includes(q) || (p.voice || []).some(v => v.text.toLowerCase().includes(q)))));
    tree = `<div class="sb-label">${hits.length} result${hits.length === 1 ? '' : 's'}</div>` + (hits.map(it => `<div class="row" data-go="${it.type === 'folder' ? 'folder' : 'nb'}-${it.id}">
      ${it.type === 'folder' ? `<span class="ic" style="color:${esc(it.color)}">${I.folder}</span>` : `<span class="dot" style="background:${esc(it.cover)}"></span>`}
      <span class="name">${esc(it.name)}</span><span class="count">${esc(pathOf(it.id).map(p => p.name).join(' / '))}</span></div>`).join('') || '<div class="note" style="padding:8px 10px">Nothing matches. Try a word from inside a note.</div>');
  } else {
    tree = `<div class="row ${S.view.name === 'home' && !S.view.folderId ? 'active' : ''}" data-go="" data-drop="root">${ic('home')}<span class="name">Home</span><span class="count">${notebooks().length}</span></div>
      <div class="sb-label">Folders &amp; notebooks</div>${rowsFor(null, 0) || '<div class="note" style="padding:8px 10px">No notebooks yet.</div>'}
      ${sharedByMe().length ? `<div class="sb-label">Shared by you</div>${sharedByMe().map(it => sharedRow(it, activeId)).join('')}` : ''}
      ${sharedWithMe().length ? `<div class="sb-label">Shared with me</div>${sharedWithMe().map(it => sharedRow(it, activeId)).join('')}` : ''}`;
  }
  const searchFocused = document.activeElement && document.activeElement.id === 'sb-q';
  sb.innerHTML = `
    <div class="sb-head"><div class="brand"><img class="brand-logo" src="${LOGO}" alt="">NoteTip</div>
      ${themeBtn()}<button class="iconbtn" id="sb-close" aria-label="Hide library">${I.chevL}</button></div>
    <label class="sb-search">${ic('search')}<input id="sb-q" placeholder="Search notebooks and notes" value="${esc(S.query)}" aria-label="Search"></label>
    <div class="sb-actions"><button class="btn" id="sb-nb">${ic('plus')}Notebook</button><button class="btn" id="sb-folder">${ic('plus')}Folder</button></div>
    <button class="btn sb-import" id="sb-import">${ic('slides')}Notes from a file or video</button>
    <div class="sb-tree" id="sb-tree">${tree}</div>
    <div class="sb-foot"><span class="sync-dot ${S.mode === 'local' ? 'local' : ''}"></span>${S.mode === 'cloud' ? 'Synced to your account' : window.NT_STANDALONE ? 'Saved on this device' : 'Saved in this browser only'}</div>`;
  const qi = $('#sb-q', sb);
  qi.oninput = () => { S.query = qi.value; renderSidebar(); };
  if (searchFocused){ qi.focus(); qi.setSelectionRange(qi.value.length, qi.value.length) }
  $('#sb-close', sb).onclick = () => setSidebar(false);
  $('#sb-nb', sb).onclick = () => newNotebookDialog(currentFolderId());
  $('#sb-folder', sb).onclick = () => newFolderDialog(currentFolderId());
  $('#sb-import', sb).onclick = () => IO.openImport(currentFolderId());
  const treeEl = $('#sb-tree', sb);
  treeEl.onclick = e => {
    const tw = e.target.closest('[data-twist]');
    if (tw){ e.stopPropagation(); const id = tw.dataset.twist; S.expanded.has(id) ? S.expanded.delete(id) : S.expanded.add(id); lsSet('inkwell.exp', JSON.stringify([...S.expanded])); renderSidebar(); return }
    const row = e.target.closest('[data-go]'); if (row) go(row.dataset.go ? '#' + row.dataset.go : '');
  };
  wireDnD(treeEl);
}
function currentFolderId(){
  if (S.view.name === 'home') return S.view.folderId;
  const nb = S.items.get(S.view.id); return nb ? nb.parentId || null : null;
}
function wireDnD(root){
  root.addEventListener('dragstart', e => { const d = e.target.closest('[data-drag]'); if (!d) return; e.dataTransfer.setData('text/plain', d.dataset.drag); e.dataTransfer.effectAllowed = 'move' });
  root.addEventListener('dragover', e => { const t = e.target.closest('[data-drop]'); if (!t) return; e.preventDefault(); $$('.drop', root).forEach(x => x !== t && x.classList.remove('drop')); t.classList.add('drop') });
  root.addEventListener('dragleave', e => { const t = e.target.closest('[data-drop]'); if (t && !t.contains(e.relatedTarget)) t.classList.remove('drop') });
  root.addEventListener('drop', e => {
    const t = e.target.closest('[data-drop]'); if (!t) return; e.preventDefault(); t.classList.remove('drop');
    const id = e.dataTransfer.getData('text/plain'); if (!id) return;
    moveItem(id, t.dataset.drop === 'root' ? null : t.dataset.drop);
  });
}
function moveItem(id, target){
  const it = S.items.get(id); if (!it || id === target) return;
  if (it.type === 'folder' && target && isDescendant(target, id)){ toast("A folder can't go inside one of its own folders."); return }
  if ((it.parentId || null) === (target || null)) return;
  it.parentId = target || null; Store.put(it);
  if (target) S.expanded.add(target);
  toast(`Moved “${it.name}” to ${target ? S.items.get(target).name : 'Home'}`);
  render();
}

/* ---------- menus & dialogs ---------- */
function closeMenus(){ $$('.menu').forEach(m => m.remove()) }
document.addEventListener('click', e => { if (!e.target.closest('.menu') && !e.target.closest('[data-menu]')) closeMenus() });
document.addEventListener('keydown', e => { if (e.key === 'Escape'){ closeMenus(); closeModal(); closeSheet(); if (S.popOpen){ S.popOpen = false; updateBadge() } } });
function openMenu(anchor, items){
  closeMenus();
  const m = document.createElement('div'); m.className = 'menu'; m.setAttribute('role','menu');
  m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : `<button role="menuitem" data-i="${i}" class="${it.danger ? 'danger' : ''}">${ic(it.icon)}${esc(it.label)}</button>`).join('');
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w)) + 'px';
  m.style.top = (r.bottom + h + 8 > window.innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px';
  m.onclick = e => { const b = e.target.closest('[data-i]'); if (!b) return; closeMenus(); items[+b.dataset.i].run() };
  m.querySelector('button')?.focus();
}
function closeModal(){ $$('.modal-back').forEach(m => { if (m._onClose) m._onClose(); m.remove() }) }
function modal({title, body, actions, onMount, wide, onClose}){
  closeModal();
  const back = document.createElement('div'); back.className = 'modal-back';
  back.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}</h3>${body}<div class="acts">${actions.map((a, i) => `<button class="btn ${a.kind || ''}" data-a="${i}">${a.icon ? ic(a.icon) : ''}${esc(a.label)}</button>`).join('')}</div></div>`;
  back._onClose = onClose;
  document.body.appendChild(back);
  back.addEventListener('mousedown', e => { if (e.target === back) closeModal() });
  $$('[data-a]', back).forEach(b => b.onclick = async () => { const a = actions[+b.dataset.a]; if (a.run){ const r = await a.run(back); if (r === false) return } closeModal() });
  const form = $('.modal', back);
  form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file'){ e.preventDefault(); const primary = actions.findIndex(a => a.kind && a.kind.includes('primary')); if (primary >= 0) $(`[data-a="${primary}"]`, back).click() } });
  onMount && onMount(back);
  setTimeout(() => ($('input:not([type=file])', back) || $('.btn.primary', back) || $('.btn', back))?.focus(), 20);
  return back;
}
function swatchRow(name, val){ return `<div class="swatches" data-sw="${name}">${COVERS.map(c => `<button type="button" class="sw ${c === val ? 'on' : ''}" style="--c:${c}" data-c="${c}" aria-label="Color ${c}"></button>`).join('')}</div>` }
function wireSwatches(root){ $$('[data-sw]', root).forEach(row => row.onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; $$('.sw', row).forEach(x => x.classList.toggle('on', x === b)); row.dataset.val = b.dataset.c }) }
const swVal = (root, name, fallback) => $(`[data-sw="${name}"]`, root).dataset.val || fallback;
function paperPreview(type){
  const rule = 'var(--rule)';
  return {
    lined:`background-image:repeating-linear-gradient(to bottom,transparent 0 9px,${rule} 9px 10px)`,
    college:`background-image:linear-gradient(to right,transparent 13px,var(--margin) 13px 14px,transparent 14px),repeating-linear-gradient(to bottom,transparent 0 9px,${rule} 9px 10px)`,
    graph:`background-image:linear-gradient(to bottom,${rule} 1px,transparent 1px),linear-gradient(to right,${rule} 1px,transparent 1px);background-size:9px 9px`,
    dotted:`background-image:radial-gradient(circle at 1px 1px,${rule} 1.2px,transparent 1.4px);background-size:9px 9px`,
    blank:''
  }[type];
}
function paperOpts(val){ return `<div class="opts" data-opt="paper">${PAPER_TYPES.map(([k, l]) => `<button type="button" class="opt ${k === val ? 'on' : ''}" data-v="${k}"><span class="pv" style="background-color:var(--paper);${paperPreview(k)}"></span>${l}</button>`).join('')}</div>` }
function newNotebookDialog(parentId){
  modal({title:'New notebook', body:`
    <div class="field"><label for="nn-name">Name</label><input class="input" id="nn-name" placeholder="e.g. Chemistry: Unit 4" maxlength="80"></div>
    <div class="field"><span class="lbl">Paper</span>${paperOpts('lined')}</div>
    <div class="field"><span class="lbl">Cover</span>${swatchRow('cover', COVERS[notebooks().length % COVERS.length])}</div>
    <div class="field"><label for="nn-folder">Folder</label><select class="input" id="nn-folder">${folderOptions(parentId)}</select></div>`,
    onMount: back => { wireSwatches(back); $('[data-opt="paper"]', back).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; $$('.opt', back).forEach(x => x.classList.toggle('on', x === b)) } },
    actions:[{label:'Cancel'}, {label:'Create notebook', kind:'primary', run: back => {
      const nb = makeNotebook({name: $('#nn-name', back).value.trim() || 'Untitled notebook', parentId: $('#nn-folder', back).value || null, cover: swVal(back, 'cover', COVERS[notebooks().length % COVERS.length])});
      nb.settings.paper = $('.opt.on', back)?.dataset.v || 'lined';
      Store.put(nb, 50); if (nb.parentId) S.expanded.add(nb.parentId);
      go('#nb-' + nb.id);
      setTimeout(() => $('#ed-ta')?.focus(), 60);
    }}]});
}
function folderOptions(sel, excludeId){
  const out = [`<option value="">Home</option>`];
  (function walk(pid, depth){ childrenOf(pid).filter(x => x.type === 'folder' && x.id !== excludeId).sort((a, b) => a.name.localeCompare(b.name)).forEach(f => { out.push(`<option value="${f.id}" ${f.id === sel ? 'selected' : ''}>${'  '.repeat(depth)}${depth ? '└ ' : ''}${esc(f.name)}</option>`); walk(f.id, depth + 1) }) })(null, 0);
  return out.join('');
}
function newFolderDialog(parentId){
  modal({title:'New folder', body:`
    <div class="field"><label for="nf-name">Name</label><input class="input" id="nf-name" placeholder="e.g. History" maxlength="60"></div>
    <div class="field"><span class="lbl">Color</span>${swatchRow('color', COVERS[folders().length % COVERS.length])}</div>
    <div class="field"><label for="nf-parent">Inside</label><select class="input" id="nf-parent">${folderOptions(parentId)}</select></div>`,
    onMount: wireSwatches,
    actions:[{label:'Cancel'}, {label:'Create folder', kind:'primary', run: back => {
      const f = {id:uid(), type:'folder', name: $('#nf-name', back).value.trim() || 'New folder', parentId: $('#nf-parent', back).value || null, color: swVal(back, 'color', COVERS[folders().length % COVERS.length]), createdAt:Date.now(), updatedAt:Date.now()};
      Store.put(f, 50); if (f.parentId) S.expanded.add(f.parentId); render(); toast(`Created folder “${f.name}”`);
    }}]});
}
function renameDialog(it){
  modal({title:`Rename ${it.type}`, body:`<div class="field"><label for="rn">Name</label><input class="input" id="rn" value="${esc(it.name)}" maxlength="80"></div>`,
    actions:[{label:'Cancel'}, {label:'Rename', kind:'primary', run: back => { const v = $('#rn', back).value.trim(); if (v){ it.name = v; Store.put(it); render() } }}]});
}
function moveDialog(it){
  modal({title:`Move “${it.name}”`, body:`<div class="field"><label for="mv">Move to</label><select class="input" id="mv">${folderOptions(it.parentId, it.type === 'folder' ? it.id : null)}</select></div>`,
    actions:[{label:'Cancel'}, {label:'Move', kind:'primary', run: back => moveItem(it.id, $('#mv', back).value || null)}]});
}
function colorDialog(it){
  modal({title:`Color for “${it.name}”`, body:swatchRow('c', it.type === 'folder' ? it.color : it.cover), onMount:wireSwatches,
    actions:[{label:'Cancel'}, {label:'Save', kind:'primary', run: back => { const c = swVal(back, 'c', null); if (c){ if (it.type === 'folder') it.color = c; else it.cover = c; Store.put(it); render() } }}]});
}
function deleteDialog(it){
  const n = it.type === 'folder' ? descCount(it.id) : 0;
  modal({title:`Delete “${it.name}”?`, body:`<p class="muted" style="margin:0">${it.shared ? 'This notebook is shared, so it disappears for everyone who has it. ' : ''}${it.type === 'folder' ? (n ? `This also deletes the ${n} notebook${n === 1 ? '' : 's'} inside it. ` : '') : 'All pages, handwriting, voice notes, the overview and quiz results go with it. '}This can't be undone.</p>`,
    actions:[{label:'Cancel'}, {label:'Delete', kind:'danger solid', run: () => {
      const kill = id => { const x = S.items.get(id); childrenOf(id).forEach(c => kill(c.id)); if (x && x.type === 'notebook') x.pages.forEach(p => Store.removeInk(x.id + '_' + p.id)); Store.remove(id) };
      const parent = it.parentId; kill(it.id); toast(`Deleted “${it.name}”`);
      if (S.view.name === 'notebook' && !S.items.get(S.view.id)) go(parent ? '#folder-' + parent : '');
      else if (S.view.name === 'home' && S.view.folderId && !S.items.get(S.view.folderId)) go(parent ? '#folder-' + parent : '');
      else render();
    }}]});
}
function itemMenu(anchor, it){
  const items = [
    {icon:'open', label:'Open', run:() => go((it.type === 'folder' ? '#folder-' : '#nb-') + it.id)},
    {icon:'pencil', label:'Rename', run:() => renameDialog(it)},
    {icon:'move', label:'Move to…', run:() => moveDialog(it)},
    {icon:'book', label: it.type === 'folder' ? 'Folder color' : 'Cover color', run:() => colorDialog(it)}
  ];
  if (it.shared){
    const own = Share.isOwner(it);
    const list = [{icon:'open', label:'Open', run:() => go('#nb-' + it.id)}, {icon:'people', label:'Sharing…', run:() => shareDialog(it)}, {icon:'copy', label:'Save a private copy', run:() => { const c = Share.copy(it); toast(`Saved “${c.name}” to your notebooks`); render() }}, {icon:'download', label:'Export…', run:() => IO.openExport(it, 'export')}];
    if (own) list.push('-', {icon:'trash', label:'Delete for everyone', danger:true, run:() => deleteDialog(it)});
    openMenu(anchor, list); return;
  }
  if (it.type === 'notebook') items.push({icon:'people', label:'Share…', run:() => shareDialog(it)}, {icon:'download', label:'Export…', run:() => IO.openExport(it, 'export')});
  items.push('-', {icon:'trash', label:'Delete', danger:true, run:() => deleteDialog(it)});
  openMenu(anchor, items);
}

/* ---------- home ---------- */
function folderSvg(c){ return `<svg viewBox="0 0 44 36"><path d="M2 6a4 4 0 0 1 4-4h10l4 4h18a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="${c}" opacity=".9"/><path d="M2 12h40v18a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z" fill="${c}"/><path d="M2 12h40" stroke="rgba(255,255,255,.35)"/></svg>` }
const angOpt = nb => ({rad: nb.settings.angles === 'rad'});
function bookCard(nb){
  const issues = nb.settings.math ? nb.pages.reduce((n, p) => n + MathEngine.analyze(p.text, angOpt(nb)).filter(r => r && (r.kind === 'bad' || r.kind === 'form')).length, 0) : 0;
  const peekBg = {lined:'repeating-linear-gradient(to bottom,transparent 0 6px,#C6D3EC 6px 7px)', college:'repeating-linear-gradient(to bottom,transparent 0 6px,#C6D3EC 6px 7px)', graph:'linear-gradient(to bottom,#C6D3EC 1px,transparent 1px) 0 0/6px 6px,linear-gradient(to right,#C6D3EC 1px,transparent 1px) 0 0/6px 6px', dotted:'radial-gradient(circle at 1px 1px,#B8C6E4 1px,transparent 1.2px) 0 0/6px 6px', blank:'none'}[nb.settings.paper];
  return `<div class="book" data-open="nb-${nb.id}" ${nb.shared ? '' : `draggable="true" data-drag="${nb.id}"`}>
    <div class="cover" style="--c:${esc(nb.cover)}" role="link" tabindex="0" aria-label="Open ${esc(nb.name)}">
      <div class="rings">${'<i></i>'.repeat(6)}</div>
      <div class="label"><b>${esc(nb.name)}</b><span></span></div>
      <div class="paper-peek" style="background:${peekBg},#fff"></div>
    </div>
    <div class="bt"><div class="tt"><div class="nm">${esc(nb.name)}</div>
      <div class="sub">${ago(nb.updatedAt)} · ${nb.pages.length} page${nb.pages.length === 1 ? '' : 's'}</div>
      <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">${nb.example ? '<span class="chip">Example</span>' : ''}${nb.source ? '<span class="chip">From a file</span>' : ''}${nb.shared ? (Share.isOwner(nb) ? '<span class="chip blue">Shared by you</span>' : `<span class="chip green">From ${esc(Share.ownerName(nb.owner) || 'someone')}</span>`) : ''}${issues ? `<span class="chip red">${issues} math issue${issues === 1 ? '' : 's'}</span>` : ''}</div></div>
      <button class="more" data-menu="${nb.id}" aria-label="More for ${esc(nb.name)}">${I.more}</button></div>
  </div>`;
}
function renderHome(){
  const fid = S.view.folderId; const folder = fid ? S.items.get(fid) : null;
  const kids = childrenOf(fid);
  const sorter = S.sort === 'name' ? (a, b) => a.name.localeCompare(b.name) : (a, b) => b.updatedAt - a.updatedAt;
  const fs = kids.filter(x => x.type === 'folder').sort(sorter), ns = kids.filter(x => x.type === 'notebook').sort(sorter);
  const crumbs = folder ? `<div class="crumbs"><a href="#">Home</a>${pathOf(fid).map(p => `<span class="sep">/</span><a href="#folder-${p.id}">${esc(p.name)}</a>`).join('')}</div>` : '';
  const recent = !folder ? notebooks().sort((a, b) => b.updatedAt - a.updatedAt)[0] : null;
  $('#main').innerHTML = `
  <header class="topbar">${sbToggleBtn()}<div class="crumbs" style="font-weight:600;color:var(--fg)">${folder ? '' : 'Library'}</div>${crumbs}${brandTop()}<div class="grow"></div><span class="savestate" id="savestate"></span>${themeBtn()}</header>
  <div class="home">
    <div class="home-head">
      <div class="home-title">
        ${folder ? '' : `<img class="home-logo" src="${LOGO_BIG}" alt="NoteTip logo">`}
        <div style="display:flex;flex-direction:column;gap:6px;min-width:0">
        <span class="eyebrow">${folder ? 'Folder' : 'Your notebooks'}</span>
        <h1>${folder ? esc(folder.name) : 'NoteTip'}</h1>
        ${recent ? `<span class="muted">Last edited: <a href="#nb-${recent.id}" style="color:var(--accent)">${esc(recent.name)}</a>, ${ago(recent.updatedAt)}</span>` : ''}
        </div>
      </div>
      <div class="home-actions">
        <div class="seg" role="group" aria-label="Sort"><button class="${S.sort === 'recent' ? 'on' : ''}" data-sort="recent">Recent</button><button class="${S.sort === 'name' ? 'on' : ''}" data-sort="name">A–Z</button></div>
        <button class="btn" id="h-import" data-menu="import">${ic('upload')}Import</button>
        <button class="btn" id="h-folder">${ic('folder')}New folder</button>
        <button class="btn primary" id="h-nb">${ic('plus')}New notebook</button>
        ${folder ? `<button class="iconbtn" data-menu="${folder.id}" aria-label="Folder options">${I.more}</button>` : ''}
      </div>
    </div>
    <button class="import-card" id="h-import2">
      <span class="ic-wrap">${I.slides}</span>
      <span class="ttl"><b>Turn slides, documents or videos into notes</b><span>Upload a PowerPoint, PDF, Word file, photos or a lecture video. NoteTip writes color-coded study notes you can edit, quiz on and annotate.</span></span>
      <span class="legend">${Ink.TAGS.slice(0, 5).map(t => `<i class="hl-${t.k}">${t.label}</i>`).join('')}</span>
    </button>
    ${S.mode === 'local' && !window.NT_STANDALONE ? `<div class="banner">${ic('book')}<div>Your notebooks are saved in this browser only. Sign in and open NoteTip from your account to keep them synced.</div></div>` : ''}
    ${fs.length ? `<section class="section"><div class="section-head"><h2>Folders</h2><span class="chip">${fs.length}</span></div>
      <div class="grid-folders">${fs.map(f => `<div class="folder-card" data-open="folder-${f.id}" data-drop="${f.id}" draggable="true" data-drag="${f.id}" role="link" tabindex="0">
        <span class="folder-ic">${folderSvg(esc(f.color || COVERS[0]))}</span>
        <div class="meta"><div class="nm">${esc(f.name)}</div><div class="sub">${descCount(f.id)} notebook${descCount(f.id) === 1 ? '' : 's'}${childrenOf(f.id).some(c => c.type === 'folder') ? ' · has folders' : ''}</div></div>
        <button class="more" data-menu="${f.id}" aria-label="More for ${esc(f.name)}">${I.more}</button></div>`).join('')}</div></section>` : ''}
    ${!folder && sharedWithMe().length ? `<section class="section"><div class="section-head"><h2>Shared with me</h2><span class="chip">${sharedWithMe().length}</span><span class="note">Notebooks other people shared. You work in them together.</span></div>
      <div class="grid-books">${sharedWithMe().map(bookCard).join('')}</div></section>` : ''}
    ${!folder && sharedByMe().length ? `<section class="section"><div class="section-head"><h2>Shared by you</h2><span class="chip">${sharedByMe().length}</span><span class="note">Everyone you've invited to NoteTip can open these.</span></div>
      <div class="grid-books">${sharedByMe().map(bookCard).join('')}</div></section>` : ''}
    <section class="section"><div class="section-head"><h2>Notebooks</h2><span class="chip">${ns.length}</span></div>
      <div class="grid-books">${ns.map(bookCard).join('')}
        <div class="book"><button class="newbook" id="h-nb2">${ic('plus')}<span>New notebook</span></button></div></div>
      ${!ns.length && !fs.length ? `<div class="empty">This folder is empty. Make a notebook here, or drag one in from the library.</div>` : ''}
    </section>
  </div>`;
  const main = $('#main');
  $('#h-nb').onclick = $('#h-nb2').onclick = () => newNotebookDialog(fid);
  $('#h-folder').onclick = () => newFolderDialog(fid);
  $('#h-import2').onclick = () => IO.openImport(fid);
  $$('[data-sort]').forEach(b => b.onclick = () => { S.sort = b.dataset.sort; lsSet('inkwell.sort', S.sort); render() });
  main.onclick = e => {
    const m = e.target.closest('[data-menu]');
    if (m){
      e.stopPropagation();
      if (m.dataset.menu === 'import') openMenu(m, [{icon:'slides', label:'Notes from slides, documents or video', run:() => IO.openImport(fid)}, {icon:'upload', label:'Restore a NoteTip backup', run:() => IO.restoreBackup(fid)}]);
      else itemMenu(m, S.items.get(m.dataset.menu));
      return;
    }
    const o = e.target.closest('[data-open]'); if (o) go('#' + o.dataset.open);
  };
  main.onkeydown = e => { if (e.key === 'Enter' && e.target.matches('[role=link]')) e.target.closest('[data-open]') && go('#' + e.target.closest('[data-open]').dataset.open) };
  wireDnD($('.home'));
}

/* ---------- notebook ---------- */
const curNb = () => S.view.name === 'notebook' ? S.items.get(S.view.id) : null;
function renderNotebook(){
  const nb = curNb(); if (!nb) return go('');
  nb.settings = Object.assign({angles:'deg', colors:true}, nb.settings);
  if (S.page >= nb.pages.length) S.page = nb.pages.length - 1;
  const path = pathOf(nb.id);
  const tabs = [['notes','Notes','notes'],['overview','Overview','overview'],['quiz','Quiz','quiz']];
  $('#main').innerHTML = `
  <header class="topbar">
    ${sbToggleBtn()}
    <div class="crumbs"><a href="#">Home</a>${path.map(p => `<span class="sep">/</span><a href="#folder-${p.id}">${esc(p.name)}</a>`).join('')}<span class="sep">/</span></div>
    <div class="nb-brand"><a href="#" class="nb-brand-link" title="Go to Home"><img src="${LOGO}" alt=""><span>NoteTip</span></a></div>
    <div class="tb-title grow"><input class="title-input" id="nb-title" value="${esc(nb.name)}" aria-label="Notebook name" maxlength="80"></div>
    <nav class="tabs" role="tablist">${tabs.map(([k, l, i]) => `<button class="tab ${S.tab === k ? 'on' : ''}" role="tab" aria-selected="${S.tab === k}" data-tab="${k}">${ic(i)}${l}</button>`).join('')}</nav>
    <span class="savestate" id="savestate"></span>
    <div class="peers" id="peers" hidden></div>
    <button class="btn share-btn ${nb.shared ? 'is-shared' : ''}" id="share-open" title="Share and work together">${ic('people')}<span>${nb.shared ? 'Shared' : 'Share'}</span></button>
    <button class="iconbtn ${isView(nb) ? 'on' : ''}" id="view-btn" aria-label="${isView(nb) ? 'Leave view mode' : 'View mode'}" title="${forcedView(nb) ? 'You can only view this shared notebook' : 'View mode: read without editing'}" aria-pressed="${isView(nb)}">${I.eye}</button>
    <button class="iconbtn ${S.aiOpen ? 'on' : ''}" id="ai-btn" aria-label="Ask NoteTip AI" title="Ask NoteTip AI">${I.spark}</button>
    <button class="iconbtn" id="share-btn" aria-label="More: version history, export, print" title="Version history, export, print" data-menu="share">${I.more}</button>
    <button class="iconbtn" id="set-btn" aria-label="Notebook settings" title="Notebook settings">${I.gear}</button>
  </header>
  <div class="nb-body"><section class="nb-main" id="nb-main"></section><aside class="ai-panel" id="ai-panel" ${S.aiOpen ? '' : 'hidden'}></aside></div>`;
  const t = $('#nb-title');
  t.oninput = () => { nb.name = t.value.trim() || 'Untitled notebook'; nb.example = false; Store.put(nb); clearTimeout(t._r); t._r = setTimeout(renderSidebar, 400) };
  t.onkeydown = e => { if (e.key === 'Enter') t.blur() };
  $$('[data-tab]').forEach(b => b.onclick = () => { S.tab = b.dataset.tab; $$('[data-tab]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', String(x === b)) }); renderTab() });
  $('#ai-btn').onclick = () => toggleAI();
  $('#set-btn').onclick = openSettings;
  $('#share-open').onclick = () => shareDialog(nb);
  $('#view-btn').onclick = () => { if (forcedView(nb)){ toast('You can only view this shared notebook. Ask the owner of NoteTip for edit access.'); return } S.viewMode = !S.viewMode; renderNotebook() };
  t.readOnly = forcedView(nb);
  Share.renderPeers();
  Versions.opened(nb);
  $('#share-btn').onclick = e => { e.stopPropagation(); openMenu(e.currentTarget, [
    {icon:'clock', label:'Version history', run:() => openVersions(nb)},
    '-',
    {icon:'download', label:'Export…', run:() => IO.openExport(nb, 'export')},
    {icon:'print', label:'Print…', run:() => IO.openExport(nb, 'print')},
    '-',
    {icon:'slides', label:'Add notes from a file or video…', run:() => IO.openImport(nb.parentId || null, nb)},
    ...(Ink.V.t ? [{icon:'speaker', label:'Read this page aloud', run:() => Ink.speak(nb.pages[S.page].text, 'page')}] : [])
  ]) };
  document.documentElement.style.setProperty('--aiw', S.aiOpen && window.innerWidth > 1100 ? '390px' : '0px');
  renderTab(); if (S.aiOpen) renderAI();
}
function renderTab(){
  S.popOpen = false; Ink.unmount();
  $('.app').classList.toggle('view-mode', S.view.name === 'notebook' && isView(curNb()));
  if (S.tab === 'notes') renderNotes(); else if (S.tab === 'overview') renderOverview(); else renderQuiz();
  measureTop();
}
function paperClasses(nb){
  const s = nb.settings;
  return `paper pt-${s.paper} ${s.color !== 'auto' ? 'pc-' + s.color : ''} sp-${s.spacing} f-${s.font}`;
}

/* notes editor */
let lastRes = [], caretLine = -1, prevIssueCount = 0, convertedHint = false;
const forcedView = nb => !!(nb && nb.shared && Share.readOnly());
const isView = nb => !!nb && (S.viewMode || forcedView(nb));
function renderNotes(){
  const nb = curNb(); if (!nb) return;
  if (nb.shared && !Share.isReady(nb)){ $('#nb-main').innerHTML = '<div class="loading"><div class="spin"></div><div>Opening the shared notebook…</div></div>'; return }
  if (S.page >= nb.pages.length) S.page = nb.pages.length - 1;
  const page = nb.pages[S.page]; page.voice = page.voice || [];
  const view = isView(nb);
  Share.setPresence({page:S.page});
  Ink.unmount();
  $('#nb-main').innerHTML = `
    ${view ? `<div class="viewbar">${ic('eye')}<span>${forcedView(nb) ? 'You can view this shared notebook. Ask the owner for edit access to write in it.' : 'View mode. Tap the eye button to edit again.'}</span></div>` : Ink.toolbarHtml(nb)}
    <div class="above-col">
      ${nb.source && S.page === 0 ? `<div class="srcnote">${ic(nb.source.unit === 'minutes' ? 'video' : 'slides')}Made from <b>${esc(nb.source.name)}</b>${nb.source.count ? ` · ${nb.source.count} ${esc(nb.source.count === 1 ? (nb.source.unit || 'parts').replace(/s$/, '') : (nb.source.unit || 'parts'))}` : ''}. Colors: ${Ink.TAGS.map(t => `<i class="hl-${t.k}">${t.label}</i>`).join(' ')}</div>` : ''}
      ${mediaHtml(page, view)}
    </div>
    <div class="paper-scroll" id="paper-scroll"><div class="paper-col" id="paper-col">
      <div class="${paperClasses(nb)}" id="paper" style="--z:${Zoom.get(nb)}">
        <div class="badge-dock" id="badge-dock"></div>
        <div class="ed" id="ed"><div class="ed-mirror" id="ed-mirror" aria-hidden="true"></div>
          <textarea class="ed-ta" id="ed-ta" spellcheck="true" aria-label="Page ${S.page + 1} notes" placeholder="Start writing… Try “integral of x^2 from 0 to 3 =” or pick a pen above to draw"></textarea></div>
      </div>
    </div></div>
    <div class="below-col">
      <div class="pager">
        <button class="iconbtn" id="pg-prev" aria-label="Previous page" ${S.page === 0 ? 'disabled' : ''}>${I.chevL}</button>
        <span class="pg">Page ${S.page + 1} of ${nb.pages.length}</span>
        <button class="iconbtn" id="pg-next" aria-label="Next page" ${S.page === nb.pages.length - 1 ? 'disabled' : ''}>${I.chevR}</button>
        ${view ? '' : `<button class="btn" id="pg-add">${ic('plus')}New page</button>`}
        ${nb.pages.length > 1 && !view ? `<button class="btn ghost danger" id="pg-del">${ic('trash')}Delete page</button>` : ''}
      </div>
      ${nb.pages.length > 1 ? `<div class="page-strip">${nb.pages.map((p, i) => `<button class="page-pill ${i === S.page ? 'on' : ''}" data-pg="${i}">${i + 1}. ${esc(firstLine(p.text) || 'Blank page')}</button>`).join('')}</div>` : ''}
    </div>
    ${Zoom.barHtml()}`;
  const ta = $('#ed-ta');
  ta.value = page.text; ta.readOnly = view;
  prevIssueCount = -1;
  Hist.resetText(page.text);
  ta.addEventListener('input', e => {
    page.text = ta.value; if (nb.example){ nb.example = false } Store.put(nb, 900);
    Hist.onInput(ta.value, /insertFromPaste|deleteByCut|insertFromDrop|insertLineBreak/.test(e.inputType || ''));
    if (nb.settings.math && (e.inputType === 'insertLineBreak' || (e.inputType === 'insertText' && e.data === '='))) maybeConvert(e.inputType === 'insertLineBreak');
    autosize(); scheduleOverlay();
  });
  ta.addEventListener('keydown', e => {
    if (e.key === 'Tab' && !e.shiftKey && !e.altKey && !e.metaKey && !e.ctrlKey){
      const {line, atEnd} = caretInfo(ta);
      const r = lastRes[line];
      if (r && r.kind === 'ghost' && atEnd && nb.settings.answers){
        e.preventDefault();
        const before = ta.value.slice(0, ta.selectionStart);
        insertText(ta, (/\s$/.test(before) ? '' : ' ') + r.ghost);
      }
    }
  });
  const track = () => { const l = caretInfo(ta).line; if (l !== caretLine){ caretLine = l; scheduleOverlay() } };
  ['keyup','click','focus'].forEach(ev => ta.addEventListener(ev, track));
  ta.addEventListener('blur', () => { caretLine = -1; scheduleOverlay() });
  $('#pg-prev').onclick = () => { S.page--; renderNotes() };
  $('#pg-next').onclick = () => { S.page++; renderNotes() };
  if ($('#pg-add')) $('#pg-add').onclick = () => { nb.pages.splice(S.page + 1, 0, {id:uid(), text:'', voice:[]}); S.page++; Store.put(nb, 50); renderNotes(); $('#ed-ta').focus() };
  const del = $('#pg-del');
  if (del) del.onclick = () => modal({title:`Delete page ${S.page + 1}?`, body:'<p class="muted" style="margin:0">Everything on this page, including handwriting and voice notes, will be removed.</p>', actions:[{label:'Cancel'}, {label:'Delete page', kind:'danger solid', run:() => { const [gone] = nb.pages.splice(S.page, 1); Store.removeInk(nb.id + '_' + gone.id); S.page = Math.max(0, S.page - 1); Store.put(nb, 50); renderNotes() }}]});
  $$('[data-pg]').forEach(b => b.onclick = () => { S.page = +b.dataset.pg; renderNotes() });
  Ink.mount(nb, page, {readOnly:view});
  wireMedia(nb, page);
  Zoom.wire(nb); Gestures.wire(nb);
  Zoom.apply(nb, false);
  autosize(); renderOverlay(); measureTop(); Hist.buttons();
  if (document.fonts){ document.fonts.load(`16px "${fontOf(nb.settings.font)[2]}"`).catch(() => {}).then(() => document.fonts.ready).then(() => { if ($('#ed-ta') === ta){ autosize(); renderOverlay(); Ink.refresh() } }) }
}
function maybeConvert(prevLine){
  const ta = $('#ed-ta'); if (!ta) return;
  const v = ta.value, pos = ta.selectionStart;
  const idx = v.slice(0, pos).split('\n').length - 1 - (prevLine ? 1 : 0); if (idx < 0) return;
  convertLine(ta, idx);
}
function convertLine(ta, idx){
  const v = ta.value, lines = v.split('\n'), line = lines[idx];
  if (!line || !MathEngine.WORD_RE.test(line)) return false;
  const out = MathEngine.convertWords(line); if (!out || out === line) return false;
  let start = 0; for (let i = 0; i < idx; i++) start += lines[i].length + 1;
  const hadFocus = document.activeElement === ta;
  const pos = ta.selectionStart, fromEnd = v.length - pos;
  ta.setSelectionRange(start, start + line.length); insertText(ta, out);
  const np = pos > start + line.length ? ta.value.length - fromEnd : Math.min(start + out.length, ta.value.length);
  ta.setSelectionRange(np, np);
  if (!hadFocus) ta.blur();
  if (!convertedHint){ convertedHint = true; toast('Changed to math notation. Press Ctrl+Z (or Cmd+Z) to undo.') }
  return true;
}
function convertAllWords(){
  const ta = $('#ed-ta'); if (!ta) return;
  const n = ta.value.split('\n').length;
  for (let i = 0; i < n; i++){ const lines = ta.value.split('\n'); if (MathEngine.WORD_RE.test(lines[i] || '') && /=|\bdx\b|\bto\b/.test(lines[i])) convertLine(ta, i) }
}
function firstLine(t){ return (t.split('\n').find(l => l.trim()) || '').replace(/^#+\s*/, '').trim().slice(0, 60) }
function insertText(ta, str){
  ta.focus();
  let ok = false; try { ok = document.execCommand('insertText', false, str) } catch {}
  if (!ok){ ta.setRangeText(str, ta.selectionStart, ta.selectionEnd, 'end'); ta.dispatchEvent(new Event('input')) }
}
function caretInfo(ta){
  const pos = ta.selectionStart; const before = ta.value.slice(0, pos);
  const line = before.split('\n').length - 1;
  const rest = ta.value.slice(pos); const nl = rest.indexOf('\n');
  return {line, atEnd: !(nl === -1 ? rest : rest.slice(0, nl)).trim()};
}
function autosize(){ const ta = $('#ed-ta'); if (!ta) return; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px' }
let ovRaf = 0;
function scheduleOverlay(){ cancelAnimationFrame(ovRaf); ovRaf = requestAnimationFrame(renderOverlay) }
function renderOverlay(){
  const nb = curNb(); const ta = $('#ed-ta'), mir = $('#ed-mirror'); if (!nb || !ta || !mir) return;
  const lines = ta.value.split('\n');
  lastRes = nb.settings.math ? MathEngine.analyze(ta.value, angOpt(nb)) : [];
  const show = nb.settings.answers, colors = nb.settings.colors !== false;
  mir.innerHTML = lines.map((l, i) => {
    const r = lastRes[i];
    let txt = l ? esc(l) : '​';
    const tag = colors && l ? Ink.tagOf(l) : null;
    if (tag && tag !== 'head') txt = `<span class="hl hl-${tag}">${txt}</span>`;
    const cls = tag === 'head' ? 'ml h-head' : 'ml';
    if (!r) return `<div class="${cls}">${txt}</div>`;
    if (r.kind === 'bad' || r.kind === 'form') return `<div class="${cls}"><span class="mk-${r.kind}">${txt}</span><span class="an an-bad" title="${esc(r.title)}">!</span></div>`;
    if (r.kind === 'ok') return `<div class="${cls}">${txt}<span class="an an-ok">✓</span></div>`;
    if (r.kind === 'ghost' && show && !isView(nb)) return `<div class="${cls}">${txt}<span class="an an-ghost">${/\s$/.test(l) ? '' : ' '}${esc(r.ghost)}</span>${i === caretLine ? '<span class="kbd">Tab</span>' : ''}</div>`;
    if (r.kind === 'solve' && show) return `<div class="${cls}">${txt}<span class="an an-solve">→ ${esc(r.ghost)}</span></div>`;
    return `<div class="${cls}">${txt}</div>`;
  }).join('');
  updateBadge();
}
function issuesOf(res){ return res.filter(r => r && (r.kind === 'bad' || r.kind === 'form')) }
function updateBadge(){
  const dock = $('#badge-dock'); const nb = curNb(); if (!dock || !nb) return;
  if (!nb.settings.math){ dock.innerHTML = ''; return }
  const issues = issuesOf(lastRes);
  const checked = lastRes.filter(r => r && (r.kind === 'ok' || r.kind === 'ghost')).length;
  if (!issues.length){
    S.popOpen = false;
    dock.innerHTML = checked ? `<button class="math-badge good" title="Math checked" aria-label="${checked} lines of math checked, no problems">${ic('check')}${checked}</button>` : '';
    const b = $('.math-badge', dock); if (b) b.onclick = () => toast(`${checked} line${checked === 1 ? '' : 's'} of math checked. No mistakes found.`);
    prevIssueCount = 0; return;
  }
  const pulse = prevIssueCount >= 0 && issues.length > prevIssueCount;
  prevIssueCount = issues.length;
  dock.innerHTML = `<button class="math-badge bad ${pulse ? 'pulse' : ''}" aria-expanded="${S.popOpen}" aria-label="${issues.length} math problem${issues.length === 1 ? '' : 's'} on this page"><span class="bang">!</span><span class="n">${issues.length}</span></button>
    <div class="math-pop" ${S.popOpen ? '' : 'hidden'} role="dialog" aria-label="Math problems">
      <h4><span class="an an-bad" style="margin:0">!</span>${issues.length} problem${issues.length === 1 ? '' : 's'} on this page</h4>
      ${issues.map(r => `<div class="issue"><div class="k">${esc(r.title)}<span class="ln">Line ${r.line + 1}</span></div><code>${esc(r.src)}</code><p>${esc(r.msg)}</p>
        <div class="ia"><button class="btn" data-goto="${r.line}">Go to line</button>${S.sample ? `<button class="btn" data-ask="${r.line}">${ic('spark')}Explain</button>` : ''}</div></div>`).join('')}
    </div>`;
  $('.math-badge', dock).onclick = e => { e.stopPropagation(); S.popOpen = !S.popOpen; updateBadge() };
  $$('[data-goto]', dock).forEach(b => b.onclick = () => { S.popOpen = false; updateBadge(); gotoLine(+b.dataset.goto) });
  $$('[data-ask]', dock).forEach(b => b.onclick = () => {
    const r = lastRes[+b.dataset.ask]; S.popOpen = false; updateBadge();
    if (!S.aiOpen) toggleAI(true);
    sendChat(`On line ${r.line + 1} I wrote "${r.src}". The checker says: ${r.title}. ${r.msg} Explain what went wrong and how to fix it, step by step, without being wordy.`);
  });
}
document.addEventListener('click', e => { if (S.popOpen && !e.target.closest('#badge-dock')){ S.popOpen = false; updateBadge() } });
function gotoLine(n){
  const ta = $('#ed-ta'); if (!ta) return;
  if (Ink.prefs.tool !== 'type'){ $('#inkbar [data-tool="type"]')?.click() }
  const lines = ta.value.split('\n'); let start = 0; for (let i = 0; i < n; i++) start += lines[i].length + 1;
  ta.focus({preventScroll:true}); ta.setSelectionRange(start, start + lines[n].length);
  const ml = $('#ed-mirror').children[n];
  if (ml){ const y = ml.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3; window.scrollTo({top:y, behavior:'smooth'}) }
  caretLine = n; scheduleOverlay();
}

/* settings sheet */
function closeSheet(){ $$('.sheet,.sheet-scrim').forEach(x => x.remove()) }
function openSettings(){
  closeSheet(); const nb = curNb(); const s = nb.settings;
  if (forcedView(nb)){ toast('You can only view this shared notebook.'); return }
  const scrim = document.createElement('div'); scrim.className = 'sheet-scrim'; scrim.onclick = closeSheet;
  const sh = document.createElement('aside'); sh.className = 'sheet'; sh.setAttribute('role','dialog'); sh.setAttribute('aria-label','Notebook settings');
  const seg = (key, opts) => `<div class="seg" data-set="${key}">${opts.map(([k, l]) => `<button type="button" class="${s[key] === k ? 'on' : ''}" data-v="${k}">${l}</button>`).join('')}</div>`;
  const tog = (key, title, sub, val = s[key], scope = 'nb') => `<div class="toggle"><div class="t"><b>${title}</b><span>${sub}</span></div><button class="switch ${val ? 'on' : ''}" data-tog="${key}" data-scope="${scope}" role="switch" aria-checked="${!!val}" aria-label="${title}"></button></div>`;
  sh.innerHTML = `<div class="sheet-head"><h3>Notebook settings</h3><button class="iconbtn" id="sh-x" aria-label="Close settings">${I.close}</button></div>
  <div class="sheet-body">
    ${window.NT_STANDALONE ? `<div class="field"><span class="lbl">NoteTip AI</span>
      <p class="note" style="margin:0">${ONLINE_NOTE}</p>
      ${onlineBtn()}
      <details class="own-key"><summary>Use an Anthropic API key instead</summary>
      <p class="note" style="margin:0">Paste a key from console.anthropic.com to use NoteTip AI right here. It stays on this device, and each use is billed to that API account.</p>
      <div class="linkrow"><input class="input" id="ai-key" type="password" autocomplete="off" placeholder="${NTAI.hasKey() ? 'Key saved. Paste a new one to replace it' : 'Paste your AI key'}"><button class="btn primary" id="ai-key-save">Save</button></div>
      ${NTAI.hasKey() ? '<button class="btn ghost danger" id="ai-key-del" style="align-self:flex-start">Remove key</button>' : ''}
      <span class="note" id="ai-key-msg"></span></details></div>` : ''}
    <div class="field"><span class="lbl">Appearance</span><div class="seg" id="sh-theme">${[['light','Light'],['dark','Dark'],['system','Match system']].map(([k, l]) => `<button type="button" class="${themeNow() === k ? 'on' : ''}" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="field"><span class="lbl">Paper</span>${paperOpts(s.paper)}</div>
    <div class="field"><span class="lbl">Paper color</span><div class="opts" data-set="color">${PAPER_COLORS.map(([k, l]) => `<button type="button" class="opt ${s.color === k ? 'on' : ''}" data-v="${k}"><span class="pv ${k !== 'auto' ? 'pc-' + k : ''}" style="background:var(--paper)"></span>${l}</button>`).join('')}</div></div>
    <div class="field"><span class="lbl">Line spacing</span>${seg('spacing', [['narrow','Narrow'],['medium','Medium'],['wide','Wide']])}</div>
    <div class="field"><span class="lbl">Font</span><div class="font-grid" data-set="font">${FONTS.map(([k, l, fam]) => `<button type="button" class="fopt ${s.font === k ? 'on' : ''}" data-v="${k}"><span style="font-family:'${fam}',sans-serif">Aa Notes</span><small>${l}</small></button>`).join('')}</div></div>
    <div class="field"><span class="lbl">Cover</span>${swatchRow('cover', nb.cover)}</div>
    <div class="field"><span class="lbl">Math</span>
      ${tog('math', 'Check my math', 'Marks wrong answers and badly written equations with a red ! on the page.')}
      ${tog('answers', 'Solve as I write', 'End a line with = to see the answer, including integrals and derivatives. Press Tab to write it in.')}
      <div class="toggle"><div class="t"><b>Angles for sin, cos, tan</b><span>Calculus always uses radians.</span></div>${seg('angles', [['deg','Degrees'],['rad','Radians']])}</div>
    </div>
    <div class="field"><span class="lbl">Highlights</span>
      ${tog('colors', 'Color-coded lines', 'Lines that start with Main idea:, Definition:, Example:, Formula:, Important: or Question: get a color.', s.colors !== false)}
    </div>
    <div class="field"><span class="lbl">Stylus</span>
      ${tog('stylusOnly', 'Only the stylus draws', 'Fingers scroll instead of drawing. Turns on by itself once a stylus is used.', Ink.prefs.stylusOnly, 'ink')}
    </div>
    <div class="field"><span class="lbl">Notebook</span><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="sh-export">${ic('download')}Export</button><button class="btn" id="sh-print">${ic('print')}Print</button>${nb.shared ? '' : `<button class="btn" id="sh-move">${ic('move')}Move to folder</button>`}${!nb.shared || Share.isOwner(nb) ? `<button class="btn danger" id="sh-del">${ic('trash')}Delete notebook</button>` : ''}</div></div>
  </div>`;
  document.body.append(scrim, sh);
  requestAnimationFrame(() => sh.classList.add('open'));
  const apply = () => { nb.example = false; Store.put(nb, 300); if (S.tab === 'notes') renderNotes() };
  $('#sh-x', sh).onclick = closeSheet;
  const aks = $('#ai-key-save', sh);
  if (aks) aks.onclick = async () => {
    const v = $('#ai-key', sh).value.trim(); const msg = $('#ai-key-msg', sh);
    if (!v){ msg.textContent = 'Paste a key first.'; return }
    NTAI.setKey(v); aks.disabled = true; msg.textContent = 'Checking the key…';
    try { await NTAI.test(); S.sample = NTAI.sample; msg.textContent = 'Key saved. NoteTip AI is on.'; $('#ai-key', sh).value = ''; if (S.aiOpen) renderAI() }
    catch (e){ NTAI.setKey(''); S.sample = null; msg.textContent = aiErr(e) }
    aks.disabled = false;
  };
  const akd = $('#ai-key-del', sh);
  if (akd) akd.onclick = () => { NTAI.setKey(''); S.sample = null; closeSheet(); toast('AI key removed from this device.') };
  $('#sh-theme', sh).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; $$('#sh-theme button', sh).forEach(x => x.classList.toggle('on', x === b)); setTheme(b.dataset.v) };
  $('[data-opt="paper"]', sh).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; s.paper = b.dataset.v; $$('[data-opt="paper"] .opt', sh).forEach(x => x.classList.toggle('on', x === b)); apply() };
  $$('[data-set]', sh).forEach(g => g.onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; s[g.dataset.set] = b.dataset.v; $$('[data-v]', g).forEach(x => x.classList.toggle('on', x === b)); apply() });
  $$('[data-tog]', sh).forEach(b => b.onclick = () => {
    const k = b.dataset.tog;
    if (b.dataset.scope === 'ink'){ Ink.prefs[k] = !Ink.prefs[k]; Ink.savePrefs(); b.classList.toggle('on', Ink.prefs[k]); b.setAttribute('aria-checked', String(Ink.prefs[k])); return }
    s[k] = !(k === 'colors' ? s[k] !== false : s[k]); b.classList.toggle('on', s[k]); b.setAttribute('aria-checked', String(s[k])); apply();
  });
  $('[data-sw="cover"]', sh).onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; nb.cover = b.dataset.c; $$('.sw', sh).forEach(x => x.classList.toggle('on', x === b)); Store.put(nb, 300); renderSidebar() };
  $('#sh-export', sh).onclick = () => { closeSheet(); IO.openExport(nb, 'export') };
  $('#sh-print', sh).onclick = () => { closeSheet(); IO.openExport(nb, 'print') };
  if ($('#sh-move', sh)) $('#sh-move', sh).onclick = () => { closeSheet(); moveDialog(nb) };
  if ($('#sh-del', sh)) $('#sh-del', sh).onclick = () => { closeSheet(); deleteDialog(nb) };
  $('#sh-x', sh).focus();
}

/* ---------- live updates from collaborators ---------- */
let ovT = 0;
function applyRemote(nb, pid){
  if (S.view.name !== 'notebook' || S.view.id !== nb.id) return;
  if (S.tab !== 'notes'){ clearTimeout(ovT); ovT = setTimeout(() => { if (S.tab === 'overview' && !S.aiBusy.overview) renderOverview() }, 400); return }
  const page = nb.pages[S.page]; if (!page || page.id !== pid) return;
  const ta = $('#ed-ta'); if (!ta) return;
  const old = ta.value, neu = page.text;
  if (old !== neu){
    let p = 0; while (p < old.length && p < neu.length && old[p] === neu[p]) p++;
    let q = 0; while (q < old.length - p && q < neu.length - p && old[old.length - 1 - q] === neu[neu.length - 1 - q]) q++;
    const endOld = old.length - q, shift = neu.length - old.length;
    const map = i => i <= p ? i : i >= endOld ? i + shift : p + (neu.length - q - p);
    const s0 = ta.selectionStart, s1 = ta.selectionEnd, focused = document.activeElement === ta;
    Hist.commit();
    ta.value = neu;
    Hist.resetText(neu);
    if (focused) ta.setSelectionRange(map(s0), map(s1));
    autosize(); scheduleOverlay();
  }
  Ink.refresh();
}
function shareDialog(nb){
  if (!nb) return;
  const ok = Share.available();
  const own = Share.isOwner(nb);
  let body;
  if (!ok){
    body = window.NT_STANDALONE ? `<p class="muted" style="margin:0">Live sharing works in the online version of NoteTip. In this app, export the notebook as a NoteTip backup (⋯ menu → Export → Backup) and send the file. The other person restores it from Home → Import.</p>` : `<p class="muted" style="margin:0">Sharing needs NoteTip opened from your account while you're signed in, so notebooks can sync. Right now your notebooks are saved in this browser only.</p>`;
  } else if (!nb.shared){
    body = `<p class="muted" style="margin:0">Work on <b>${esc(nb.name)}</b> with other people at the same time. Everyone sees new typing, handwriting and voice notes within a second or two.</p>
      <ol class="share-steps">
        <li><b>Invite people to NoteTip.</b> Use the <b>Share</b> button in the bar at the very top of the page, above NoteTip, and give them access that lets them edit. People with view-only access can read shared notebooks but not write in them.</li>
        <li><b>Share this notebook.</b> It moves to Shared notebooks, where everyone you've invited can open it. Your other notebooks stay private.</li>
      </ol>`;
  } else {
    body = `<div class="share-status">${ic('people')}<div><b>Shared</b><span class="note">Everyone you've shared NoteTip with can open and edit this notebook.${own ? '' : ' Someone else shared it.'}</span></div></div>
      <div class="field"><span class="lbl">Here now</span><div id="share-here">${Share.herePeopleHtml()}</div></div>
      <div class="field"><span class="lbl">Link to this notebook</span><div class="linkrow"><input class="input" id="share-link" readonly value="${esc(Share.linkFor(nb))}"><button class="btn" id="share-copy">${ic('link')}Copy</button></div>
      <span class="note">Only people you've invited to NoteTip can open it.</span></div>`;
  }
  const actions = !ok ? [{label:'Close', kind:'primary'}]
    : !nb.shared ? [{label:'Cancel'}, {label:'Share this notebook', kind:'primary', icon:'people', run:() => {
        if (!Share.publish(nb)) return false;
        toast(`“${nb.name}” is shared. Invite people with the Share button at the very top of the page.`);
        go('#nb-' + nb.id); setTimeout(() => { Share.open(nb); render(); shareDialog(nb) }, 50);
      }}]
    : [...(own ? [{label:'Stop sharing', kind:'danger', run:() => { Share.stop(nb); toast(`“${nb.name}” is private again.`); render() }}] : [{label:'Save a private copy', run:() => { const c = Share.copy(nb); toast(`Saved “${c.name}” to your notebooks`); render() }}]), {label:'Done', kind:'primary'}];
  modal({title: nb.shared ? 'Sharing' : 'Share notebook', body, actions, onMount: b => {
    const c = $('#share-copy', b);
    if (c) c.onclick = () => { const v = $('#share-link', b).value; navigator.clipboard?.writeText(v).then(() => toast('Link copied'), () => { $('#share-link', b).select(); toast('Press Ctrl+C to copy the link') }) };
  }});
}

/* ---------- AI helpers ---------- */
function aiErr(e){
  const c = e && e.code;
  if (c === 'not_granted') return 'AI is turned off for this page. You can allow it from the page permissions menu.';
  if (c === 'rate_limited') return 'Too many AI requests at once. Wait a moment, then try again.';
  if (c === 'cancelled') return 'Stopped.';
  if (c === 'invalid_json') return "NoteTip AI's reply came back in the wrong shape. Try again.";
  if (c === 'prompt_too_large') return 'This is too long to send at once. Try a shorter file or notebook.';
  if (c === 'images_unavailable') return "Images can't be sent to NoteTip AI in this view.";
  if (c === 'no_key') return 'NoteTip AI runs with your Claude account in the online version. Open it from notebook Settings → NoteTip AI.';
  if (c === 'bad_key') return 'Your AI key was rejected. Check it in notebook Settings.';
  if (c === 'refused') return 'NoteTip AI declined that request.';
  if (c === 'invalid_request') return (e.message || 'NoteTip AI could not handle that request.');
  return "Couldn't reach NoteTip AI. Check your connection and try again.";
}
function nbText(nb, max = 14000){
  let s = nb.pages.map((p, i) => {
    const ink = (S.ink.get(nb.id + '_' + p.id) || []).length;
    const voice = (p.voice || []).filter(v => v.text.trim());
    return `--- Page ${i + 1}${S.view.name === 'notebook' && i === S.page ? ' (open now)' : ''} ---\n${p.text.trim() || '(no typed text)'}` +
      (voice.length ? '\n' + voice.map((v, j) => `[Voice note ${j + 1}: ${v.text.trim()}]`).join('\n') : '') +
      (ink ? `\n[This page also has ${ink} handwritten pen strokes that haven't been converted to text]` : '');
  }).join('\n\n');
  if (s.length > max) s = s.slice(0, max) + '\n[...rest of notebook cut for length]';
  return s;
}
function mathFindings(nb){
  const out = [];
  nb.pages.forEach((p, pi) => MathEngine.analyze(p.text, angOpt(nb)).forEach(r => { if (r && (r.kind === 'bad' || r.kind === 'form')) out.push(`Page ${pi + 1}, line ${r.line + 1}: "${r.src}" (${r.title}: ${r.msg})`) }));
  return out;
}
function mdLite(t){
  const lines = esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
  let html = '', inList = false, para = [];
  const flush = () => { if (para.length){ html += `<p>${para.join('<br>')}</p>`; para = [] } };
  lines.forEach(l => {
    const m = l.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m){ flush(); if (!inList){ html += '<ul>'; inList = true } html += `<li>${m[1]}</li>`; return }
    if (inList){ html += '</ul>'; inList = false }
    if (!l.trim()) flush(); else para.push(l.replace(/^#+\s*/, ''));
  });
  flush(); if (inList) html += '</ul>';
  return html;
}

/* AI panel */
let chatCtl = null;
function toggleAI(force){
  S.aiOpen = force === undefined ? !S.aiOpen : force;
  const p = $('#ai-panel'); if (!p) return;
  p.hidden = !S.aiOpen; $('#ai-btn').classList.toggle('on', S.aiOpen);
  document.documentElement.style.setProperty('--aiw', S.aiOpen && window.innerWidth > 1100 ? '390px' : '0px');
  if (S.aiOpen){ renderAI(); setTimeout(() => $('#ai-q')?.focus(), 30) }
  setTimeout(() => { autosize(); renderOverlay(); Ink.refresh() }, 30);
}
function renderAI(){
  const p = $('#ai-panel'); const nb = curNb(); if (!p || !nb) return;
  const busy = !!chatCtl;
  const msgs = nb.chat || [];
  p.innerHTML = `<div class="ai-head"><h3>${ic('spark')}NoteTip AI</h3>
      ${msgs.length ? `<button class="btn ghost" id="ai-clear" style="padding:5px 8px;font-size:12px">Clear</button>` : ''}
      <button class="iconbtn" id="ai-x" aria-label="Close NoteTip AI">${I.close}</button></div>
    <div class="ai-msgs" id="ai-msgs" aria-live="polite">
      ${!S.sample ? `<div class="ai-intro">${window.NT_STANDALONE ? ONLINE_NOTE + '</div><div style="padding:4px 2px">' + onlineBtn() : 'NoteTip AI isn\'t available here. Sign in to your account to ask questions, convert handwriting, get overviews, make notes from slides and video, and generate quizzes. Math checking still works without it.'}</div>` :
        !msgs.length ? `<div class="ai-intro">NoteTip AI reads every page of <b>${esc(nb.name)}</b>, your voice notes and the math checker's results. Ask anything, or start with one of these.</div>` : ''}
      ${msgs.map((m, i) => `<div class="msg ${m.role} ${m.err ? 'err' : ''}">${m.role === 'assistant' ? mdLite(m.content) : esc(m.content)}
        ${m.role === 'assistant' && !m.err && m.content ? `<div class="mact"><button data-add="${i}">Add to page</button><button data-copy="${i}">Copy</button>${Ink.V.t ? `<button data-say="${i}">Read aloud</button>` : ''}</div>` : ''}</div>`).join('')}
    </div>
    ${S.sample ? `<div class="ai-chips">${['Summarize this page', 'Explain my math mistakes', 'Make 3 practice problems', 'What should I study next?'].map(c => `<button data-chip="${esc(c)}" ${busy ? 'disabled' : ''}>${c}</button>`).join('')}</div>
    <form class="ai-input" id="ai-form"><textarea id="ai-q" rows="1" placeholder="Ask NoteTip AI about your notes…" aria-label="Message"></textarea>
      ${busy ? `<button type="button" class="iconbtn on" id="ai-stop" aria-label="Stop">${I.stop}</button>` : `<button type="submit" class="iconbtn on" aria-label="Send">${I.send}</button>`}</form>` : ''}`;
  const box = $('#ai-msgs'); box.scrollTop = box.scrollHeight;
  $('#ai-x').onclick = () => toggleAI(false);
  const clr = $('#ai-clear'); if (clr) clr.onclick = () => { chatCtl?.abort(); nb.chat = []; Store.put(nb); renderAI() };
  $$('[data-chip]', p).forEach(b => b.onclick = () => sendChat(b.dataset.chip));
  $$('[data-add]', p).forEach(b => b.onclick = () => {
    const txt = msgs[+b.dataset.add].content.replace(/\*\*(.+?)\*\*/g, '$1');
    const pg = nb.pages[S.page]; const before = pg.text; pg.text = pg.text.replace(/\s*$/, '') + '\n\n' + txt + '\n'; Hist.push(nb.id + '_' + pg.id, Hist.textEntry(before, pg.text)); Store.put(nb);
    if (S.tab === 'notes') renderNotes(); toast(`Added to page ${S.page + 1}`);
  });
  $$('[data-copy]', p).forEach(b => b.onclick = () => { navigator.clipboard?.writeText(msgs[+b.dataset.copy].content).then(() => toast('Copied'), () => toast("Couldn't copy. Select the text instead.")) });
  $$('[data-say]', p).forEach(b => b.onclick = () => Ink.speak(msgs[+b.dataset.say].content.replace(/\*\*/g, ''), 'chat'));
  const f = $('#ai-form');
  if (f){
    const q = $('#ai-q');
    q.oninput = () => { q.style.height = 'auto'; q.style.height = Math.min(140, q.scrollHeight) + 'px' };
    q.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); f.requestSubmit() } };
    f.onsubmit = e => { e.preventDefault(); const v = q.value.trim(); if (v && !chatCtl) sendChat(v) };
    const st = $('#ai-stop'); if (st) st.onclick = () => chatCtl?.abort();
  }
}
async function sendChat(text){
  const nb = curNb(); if (!nb || !S.sample || chatCtl) return;
  nb.chat = nb.chat || [];
  nb.chat.push({role:'user', content:text});
  const reply = {role:'assistant', content:''}; nb.chat.push(reply);
  chatCtl = new AbortController(); renderAI();
  const bubble = () => $$('#ai-msgs .msg.assistant').pop();
  bubble().innerHTML = '<div class="thinking"><span class="spin"></span>Thinking…</div>';
  const findings = mathFindings(nb);
  const rules = `You are NoteTip AI, the study assistant built into the notes app NoteTip. If asked who or what you are, say you are NoteTip AI. The student's notebook "${nb.name}" is below. Answer using their notes when relevant; you can add general knowledge, and say so when something isn't in their notes. Be concise and friendly, like a good tutor. Format as plain text: short paragraphs, "-" bullets, **bold** for key words. No headings, no tables, no LaTeX: write math like 3^2 + 4^2 = 25, ∫₀³ x² dx = 9, d/dx (x³) = 3x².

The app's math checker found ${findings.length ? 'these problems:\n' + findings.join('\n') : 'no math problems.'}

NOTEBOOK:
${nbText(nb)}`;
  const history = nb.chat.slice(0, -1).filter(m => !m.err).slice(-12);
  while (history.length && history[0].role !== 'user') history.shift();
  try {
    const {text: out} = await S.sample([{role:'user', content:rules}, {role:'assistant', content:'Got it. I have the notebook.'}, ...history], {
      cache:false, signal:chatCtl.signal,
      onText: ({text}) => { reply.content = text; const b = bubble(); if (b){ b.innerHTML = mdLite(text); const box = $('#ai-msgs'); box.scrollTop = box.scrollHeight } }
    });
    reply.content = out;
  } catch (e){
    if (e && e.text) reply.content = e.text;
    if (!reply.content){ reply.content = aiErr(e); reply.err = true }
  }
  chatCtl = null;
  if (nb.chat.length > 40) nb.chat = nb.chat.slice(-40);
  Store.put(nb); if (curNb() === nb) renderAI();
}

/* ---------- overview ---------- */
function renderOverview(){
  const nb = curNb();
  const words = nb.pages.reduce((n, p) => n + (p.text.match(/\S+/g) || []).length, 0);
  let eqs = 0; const allIssues = [];
  nb.pages.forEach((p, pi) => MathEngine.analyze(p.text, angOpt(nb)).forEach(r => { if (!r) return; if (r.kind !== 'solve') eqs++; if (r.kind === 'bad' || r.kind === 'form') allIssues.push({...r, page:pi}) }));
  const ov = nb.overview; const busy = S.aiBusy.overview === nb.id;
  const stale = ov && nb.updatedAt > ov.at + 2000;
  const tagged = {}; nb.pages.forEach((p, pi) => p.text.split('\n').forEach(l => { const t = Ink.tagOf(l); if (t && t !== 'head'){ (tagged[t] = tagged[t] || []).push({text:l.replace(Ink.TAGS.find(x => x.k === t).re, ''), page:pi}) } }));
  const voices = []; nb.pages.forEach((p, pi) => (p.voice || []).forEach((v, vi) => { if (v.text.trim()) voices.push({...v, page:pi, n:vi + 1}) }));
  const ink = inkCount(nb);
  $('#nb-main').innerHTML = `<div class="wide-col">
    <div class="card">
      <div class="row-between"><div><span class="eyebrow">Overview</span><h2>${esc(nb.name)}</h2></div><span class="note">Edited ${ago(nb.updatedAt)}</span></div>
      ${nb.source ? `<div class="note">Made from ${esc(nb.source.name)}${nb.source.count ? ` (${nb.source.count} ${esc(nb.source.unit || 'parts')})` : ''}</div>` : ''}
      <div class="stats">
        <div class="stat"><b>${nb.pages.length}</b><span>page${nb.pages.length === 1 ? '' : 's'}</span></div>
        <div class="stat"><b>${words}</b><span>typed words</span></div>
        <div class="stat"><b>${ink}</b><span>pen strokes</span></div>
        <div class="stat"><b>${voices.length}</b><span>voice notes</span></div>
        <div class="stat"><b>${eqs}</b><span>math lines checked</span></div>
        <div class="stat ${allIssues.length ? 'alert' : ''}"><b>${allIssues.length}</b><span>math problem${allIssues.length === 1 ? '' : 's'}</span></div>
      </div>
    </div>
    <div class="card">
      <div class="row-between"><span class="ai-tag">${I.spark}NoteTip AI summary</span>
        ${S.sample ? `<button class="btn ${ov ? '' : 'primary'}" id="ov-gen" ${busy ? 'disabled' : ''}>${ic(ov ? 'refresh' : 'spark')}${ov ? 'Refresh' : 'Create overview'}</button>` : ''}</div>
      <div id="ov-body">${busy ? '<div class="thinking"><span class="spin"></span>Reading your notebook… this can take up to a minute.</div>' : ov ? overviewHtml(ov) + `<div class="note">${stale ? '<span class="warn">Your notes changed after this overview was made. Refresh to update it.</span>' : `Made ${ago(ov.at)} from all ${nb.pages.length} page${nb.pages.length === 1 ? '' : 's'}.`}</div>` :
        `<p class="muted" style="margin:0">${!S.sample && window.NT_STANDALONE ? ONLINE_NOTE + '</p><p style="margin:8px 0 0">' + onlineBtn() : S.sample ? 'NoteTip AI reads every page and voice note, then writes a short summary, the key points, terms to know and what to review next.' : "NoteTip AI summaries need you to be signed in. Sign in to your account to create one. Everything else on this page works without it."}</p>`}</div>
    </div>
    ${Object.keys(tagged).length ? `<div class="card"><h3>Color-coded notes</h3><div class="tag-groups">${Ink.TAGS.filter(t => tagged[t.k]).map(t => `<div class="tag-group"><div class="tg-head"><i class="hl hl-${t.k}">${t.label}</i><span class="note">${tagged[t.k].length}</span></div><ul>${tagged[t.k].slice(0, 12).map(x => `<li>${esc(x.text)}</li>`).join('')}</ul></div>`).join('')}</div></div>` : ''}
    ${allIssues.length ? `<div class="card"><h3>Math to fix</h3>${allIssues.map(r => `<div class="issue"><div class="k">${esc(r.title)}<span class="ln">Page ${r.page + 1}, line ${r.line + 1}</span></div><code>${esc(r.src)}</code><p>${esc(r.msg)}</p><div class="ia"><button class="btn" data-fix="${r.page}:${r.line}">Go to line</button></div></div>`).join('')}</div>` : ''}
    ${voices.length ? `<div class="card"><h3>Voice notes</h3><div class="voice-list">${voices.map(v => `<div class="vitem"><span class="pin-n">${v.n}</span><div class="vt"><div>${esc(v.text)}</div><div class="note">Page ${v.page + 1} · ${new Date(v.at).toLocaleString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}</div></div>${Ink.V.t ? `<button class="btn" data-vplay="${v.id}">${I.play}Play</button>` : ''}</div>`).join('')}</div></div>` : ''}
    <div class="card"><h3>Pages</h3><div class="outline">${nb.pages.map((p, i) => {
      const lines = p.text.split('\n').map(l => l.trim()).filter(Boolean);
      const pi = (S.ink.get(nb.id + '_' + p.id) || []).length;
      return `<button data-page="${i}"><span class="pn">Page ${i + 1}</span><span class="ot"><b>${esc((lines[0] || (pi ? 'Handwritten page' : 'Blank page')).replace(/^#+\s*/, ''))}</b><span>${esc(lines.slice(1, 4).join(' · ') || (pi ? `${pi} pen strokes` : '—'))}</span></span></button>`;
    }).join('')}</div></div>
  </div>`;
  $$('[data-page]').forEach(b => b.onclick = () => { S.page = +b.dataset.page; S.tab = 'notes'; renderNotebook() });
  $$('[data-fix]').forEach(b => b.onclick = () => { const [pg, ln] = b.dataset.fix.split(':').map(Number); S.page = pg; S.tab = 'notes'; renderNotebook(); setTimeout(() => gotoLine(ln), 50) });
  $$('[data-vplay]').forEach(b => b.onclick = () => { const v = voices.find(x => x.id === b.dataset.vplay); if (v) Ink.speak(v.text, 'ov:' + v.id) });
  const g = $('#ov-gen'); if (g) g.onclick = () => genOverview(nb);
}
function overviewHtml(ov){
  return `<div class="ai-out"><p>${esc(ov.summary)}</p></div>
    ${ov.keyPoints?.length ? `<div><h3 style="margin-bottom:8px">Key points</h3><ul class="kp">${ov.keyPoints.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}
    ${ov.terms?.length ? `<div><h3 style="margin-bottom:8px">Terms to know</h3><div class="terms">${ov.terms.map(t => `<div class="term"><b>${esc(t.term)}</b><span>${esc(t.definition)}</span></div>`).join('')}</div></div>` : ''}
    ${ov.reviewNext?.length ? `<div><h3 style="margin-bottom:8px">Review next</h3><ul class="kp">${ov.reviewNext.map(k => `<li>${esc(k)}</li>`).join('')}</ul></div>` : ''}`;
}
async function genOverview(nb){
  if (S.aiBusy.overview) return;
  S.aiBusy.overview = nb.id; renderOverview();
  const findings = mathFindings(nb);
  const prompt = `Read this student's notebook and write a study overview of it.
Reply with only JSON in this shape:
{"summary":"2-4 sentences on what the notebook covers","keyPoints":["3-7 short key points"],"terms":[{"term":"word","definition":"one short sentence"}],"reviewNext":["1-4 concrete suggestions of what to study or fix next"]}
Use only terms that appear in the notes (0-8 of them). If the math checker found problems, mention fixing them in reviewNext.
Math checker results: ${findings.length ? findings.join('; ') : 'no problems found'}.

Notebook "${nb.name}":
${nbText(nb)}`;
  try {
    const r = await S.sample.json(prompt);
    if (!r || typeof r.summary !== 'string') throw {code:'invalid_json'};
    nb.overview = {summary:r.summary, keyPoints:(r.keyPoints || []).map(String).slice(0, 8), terms:(r.terms || []).filter(t => t && t.term).slice(0, 10).map(t => ({term:String(t.term), definition:String(t.definition || '')})), reviewNext:(r.reviewNext || []).map(String).slice(0, 5), at:Date.now()};
    Store.put(nb, 50); nb.overview.at = nb.updatedAt;
  } catch (e){ toast(aiErr(e)) }
  S.aiBusy.overview = null;
  if (curNb() === nb && S.tab === 'overview') renderOverview();
}

/* ---------- quiz ---------- */
function renderQuiz(){
  const nb = curNb(); const run = S.quizRun && S.quizRun.nbId === nb.id ? S.quizRun : null;
  const el = $('#nb-main');
  if (S.aiBusy.quiz === nb.id){ el.innerHTML = `<div class="wide-col"><div class="card"><div class="thinking"><span class="spin"></span>Writing questions from your notes… this can take up to a minute.</div></div></div>`; return }
  if (!run){
    const hist = nb.quizHistory || [];
    const best = hist.length ? Math.max(...hist.map(h => Math.round(100 * h.score / h.total))) : null;
    el.innerHTML = `<div class="wide-col">
      <div class="card">
        <span class="eyebrow">Quiz</span><h2>Test yourself on ${esc(nb.name)}</h2>
        <div class="field"><span class="lbl">Questions</span><div class="seg" id="qz-n" style="max-width:280px">${[5, 8, 12].map(n => `<button class="${(S.qn || 5) === n ? 'on' : ''}" data-v="${n}">${n}</button>`).join('')}</div></div>
        <div class="field"><span class="lbl">Difficulty</span><div class="seg" id="qz-d" style="max-width:360px">${['Easy', 'Medium', 'Hard'].map(n => `<button class="${(S.qd || 'Medium') === n ? 'on' : ''}" data-v="${n}">${n}</button>`).join('')}</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${S.sample ? `<button class="btn primary" id="qz-ai">${ic('spark')}Generate quiz with NoteTip AI</button>` : window.NT_STANDALONE ? onlineBtn('AI quizzes with Claude') : ''}
          <button class="btn ${S.sample ? '' : 'primary'}" id="qz-quick">Quick quiz without NoteTip AI</button>
          ${nb.quiz ? `<button class="btn" id="qz-retake">${ic('refresh')}Retake last quiz</button>` : ''}
        </div>
        <p class="note" style="margin:0">${S.sample ? 'NoteTip AI quizzes mix multiple choice, true/false and short answers from every page and voice note.' : 'Quick quizzes use lines like “Definition: Nucleus — holds the DNA” and the equations in your notes. Sign in to your account to use NoteTip AI quizzes.'}</p>
      </div>
      ${hist.length ? `<div class="card"><div class="row-between"><h3>Your scores</h3><span class="note">Best ${best}% · ${hist.length} attempt${hist.length === 1 ? '' : 's'}</span></div>
        <div class="history" aria-label="Score history">${hist.slice(-20).map(h => `<i style="height:${Math.max(6, Math.round(48 * h.score / h.total))}px" title="${h.score}/${h.total} · ${new Date(h.at).toLocaleDateString()}"></i>`).join('')}</div></div>` : ''}
    </div>`;
    $$('#qz-n button').forEach(b => b.onclick = () => { S.qn = +b.dataset.v; $$('#qz-n button').forEach(x => x.classList.toggle('on', x === b)) });
    $$('#qz-d button').forEach(b => b.onclick = () => { S.qd = b.dataset.v; $$('#qz-d button').forEach(x => x.classList.toggle('on', x === b)) });
    const ai = $('#qz-ai'); if (ai) ai.onclick = () => genQuiz(nb);
    $('#qz-quick').onclick = () => { const qs = quickQuiz(nb, S.qn || 5); if (!qs.length){ toast('Not enough to quiz on yet. Add lines like “Definition: Nucleus — holds the DNA” or a few equations.'); return } startQuiz(nb, {questions:qs, source:'quick', at:Date.now()}) };
    const rt = $('#qz-retake'); if (rt) rt.onclick = () => startQuiz(nb, nb.quiz);
    return;
  }
  if (run.i >= run.quiz.questions.length) return renderQuizEnd(nb, run);
  const q = run.quiz.questions[run.i]; const ans = run.answers[run.i];
  const pct = Math.round(100 * run.i / run.quiz.questions.length);
  let body = '';
  if (q.type === 'mc' || q.type === 'tf'){
    const choices = q.type === 'tf' ? ['True', 'False'] : q.choices;
    const correctIdx = q.type === 'tf' ? (q.answer ? 0 : 1) : q.answer;
    body = `<div class="choices">${choices.map((c, i) => {
      let cls = ''; if (ans){ if (i === correctIdx) cls = 'right'; else if (i === ans.pick) cls = 'wrong' }
      return `<button class="choice ${cls}" data-pick="${i}" ${ans ? 'disabled' : ''}><span class="lt">${q.type === 'tf' ? (i ? 'F' : 'T') : 'ABCDEF'[i]}</span><span>${esc(c)}</span></button>`;
    }).join('')}</div>`;
  } else {
    body = `<form id="qz-form" style="display:flex;gap:8px;flex-wrap:wrap"><input class="input" id="qz-in" style="flex:1;min-width:180px" placeholder="Type your answer" autocomplete="off" ${ans ? `value="${esc(ans.text)}" disabled` : ''}>${ans ? '' : '<button class="btn primary">Check</button>'}</form>`;
  }
  el.innerHTML = `<div class="wide-col"><div class="card q-wrap">
    <div class="row-between"><span class="eyebrow">Question ${run.i + 1} of ${run.quiz.questions.length}</span><button class="btn ghost" id="qz-quit" style="padding:4px 8px;font-size:12px">End quiz</button></div>
    <div class="q-prog"><i style="width:${pct}%"></i></div>
    <div class="q-text">${esc(q.question)}</div>
    ${body}
    ${ans ? `<div class="feedback ${ans.ok ? 'right' : 'wrong'}"><b>${ans.ok ? 'Correct' : 'Not quite'}</b>${!ans.ok && q.type === 'short' ? `The answer is ${esc(q.answer)}. ` : ''}${esc(q.explanation || '')}</div>
      <div><button class="btn primary" id="qz-next">${run.i + 1 < run.quiz.questions.length ? 'Next question' : 'See my score'}</button></div>` : ''}
  </div></div>`;
  $('#qz-quit').onclick = () => { S.quizRun = null; renderQuiz() };
  $$('[data-pick]').forEach(b => b.onclick = () => { const i = +b.dataset.pick; const correctIdx = q.type === 'tf' ? (q.answer ? 0 : 1) : q.answer; run.answers[run.i] = {pick:i, ok:i === correctIdx}; renderQuiz() });
  const f = $('#qz-form'); if (f && !ans){ $('#qz-in').focus(); f.onsubmit = e => { e.preventDefault(); const v = $('#qz-in').value.trim(); if (!v) return; run.answers[run.i] = {text:v, ok:gradeShort(v, q.answer)}; renderQuiz() } }
  const nx = $('#qz-next'); if (nx){ nx.focus(); nx.onclick = () => { run.i++; renderQuiz() } }
}
function gradeShort(given, answer){
  const a = String(answer).trim(), g = given.trim();
  const na = MathEngine.evaluate(a), ng = MathEngine.evaluate(g);
  if (na !== null && ng !== null) return MathEngine.close(na, ng, g) || MathEngine.close(ng, na, a);
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\b(the|a|an)\b/g, '').replace(/\s+/g, ' ').trim();
  return norm(a) === norm(g) || (norm(g).length > 3 && norm(a).includes(norm(g)));
}
function renderQuizEnd(nb, run){
  const total = run.quiz.questions.length, score = run.answers.filter(a => a && a.ok).length;
  if (!run.saved){ run.saved = true; nb.quizHistory = [...(nb.quizHistory || []), {at:Date.now(), score, total}].slice(-50); Store.put(nb, 50) }
  const pct = Math.round(100 * score / total);
  $('#nb-main').innerHTML = `<div class="wide-col"><div class="card">
    <span class="eyebrow">Quiz complete</span>
    <div style="display:flex;align-items:flex-end;gap:16px;flex-wrap:wrap"><div class="score">${score}/${total}</div><div class="muted" style="padding-bottom:6px">${pct}% · ${pct >= 90 ? 'Excellent work.' : pct >= 70 ? 'Solid. Review the misses below.' : pct >= 50 ? 'Getting there. Go over the misses and retake it.' : 'Worth another pass through your notes.'}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" id="qz-again">${ic('refresh')}Retake</button><button class="btn" id="qz-newq">New quiz</button></div>
    <div class="review">${run.quiz.questions.map((q, i) => { const a = run.answers[i]; const right = q.type === 'tf' ? (q.answer ? 'True' : 'False') : q.type === 'mc' ? q.choices[q.answer] : q.answer;
      return `<div class="ri"><span class="mk" style="background:${a && a.ok ? 'var(--green)' : 'var(--red)'}">${a && a.ok ? '✓' : '✕'}</span><div><div>${esc(q.question)}</div><div class="note">Answer: ${esc(right)}</div></div></div>` }).join('')}</div>
  </div></div>`;
  $('#qz-again').onclick = () => startQuiz(nb, run.quiz);
  $('#qz-newq').onclick = () => { S.quizRun = null; renderQuiz() };
}
function startQuiz(nb, quiz){
  const questions = quiz.questions.map(q => {
    if (q.type !== 'mc') return q;
    const order = shuffle(q.choices.map((_, i) => i));
    return {...q, choices:order.map(i => q.choices[i]), answer:order.indexOf(q.answer)};
  });
  S.quizRun = {nbId:nb.id, quiz:{...quiz, questions}, i:0, answers:[]};
  renderQuiz();
}
async function genQuiz(nb){
  if (S.aiBusy.quiz) return;
  const n = S.qn || 5, diff = S.qd || 'Medium';
  S.aiBusy.quiz = nb.id; renderQuiz();
  const prompt = `Write a ${diff.toLowerCase()} quiz of exactly ${n} questions that tests a student on their own notebook below. Cover the important ideas across all pages. Mix types: mostly multiple choice, some true/false, and short answer for math or one-word answers.
Reply with only JSON: {"questions":[...]} where each question is one of:
{"type":"mc","question":"...","choices":["four","plausible","options","here"],"answer":0,"explanation":"one sentence"}
{"type":"tf","question":"a statement to judge","answer":true,"explanation":"one sentence"}
{"type":"short","question":"...","answer":"a number or 1-3 words","explanation":"one sentence"}
"answer" for mc is the 0-based index of the right choice. Base answers on the notes; if the notes contain a math mistake, use the correct math.

Notebook "${nb.name}":
${nbText(nb)}`;
  try {
    const r = await S.sample.json(prompt);
    const qs = (r && Array.isArray(r.questions) ? r.questions : []).filter(q => q && typeof q.question === 'string' && (
      (q.type === 'mc' && Array.isArray(q.choices) && q.choices.length >= 2 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.choices.length) ||
      (q.type === 'tf' && typeof q.answer === 'boolean') ||
      (q.type === 'short' && q.answer !== undefined && q.answer !== null))).map(q => ({...q, choices: q.choices && q.choices.map(String), answer: q.type === 'short' ? String(q.answer) : q.answer}));
    if (!qs.length) throw {code:'invalid_json'};
    nb.quiz = {questions:qs, source:'ai', at:Date.now()}; Store.put(nb, 50);
    S.aiBusy.quiz = null;
    if (curNb() === nb && S.tab === 'quiz') startQuiz(nb, nb.quiz);
    return;
  } catch (e){ toast(aiErr(e)) }
  S.aiBusy.quiz = null;
  if (curNb() === nb && S.tab === 'quiz') renderQuiz();
}
function quickQuiz(nb, n){
  const defs = [], maths = [];
  nb.pages.forEach(p => {
    const res = MathEngine.analyze(p.text, angOpt(nb));
    p.text.split('\n').forEach((line, i) => {
      const r = res[i];
      if (r && (r.kind === 'ok' || r.kind === 'ghost') && !/[∫Σ∑]|d\/d|lim/.test(line)){
        const lhs = line.split('=')[0].replace(/^[^:]*[a-zA-Z]{3,}[^:]*:\s*/, '').trim();
        const val = MathEngine.evaluate(lhs);
        if (val !== null && /[-+×÷*/^√%²³]/.test(lhs)) maths.push({type:'short', question:`Work it out: ${lhs}`, answer:MathEngine.fmt(val), explanation:`${lhs} = ${MathEngine.fmt(val)}`});
        return;
      }
      const body = line.replace(/^\s*(?:definition|def)\s*:\s*/i, '');
      const m = body.match(/^\s*(?:[-•*]\s+)?([A-Za-z][A-Za-z0-9 ()'’-]{1,40}?)\s*(?::|—|–| - )\s*(.{8,})$/);
      if (m && !/=/.test(line) && !/^(main idea|example|important|question|formula|q|ex)$/i.test(m[1].trim())) defs.push({term:m[1].trim(), def:m[2].trim()});
    });
  });
  const qs = [];
  shuffle(defs).forEach(d => {
    const others = shuffle(defs.filter(x => x.term.toLowerCase() !== d.term.toLowerCase())).slice(0, 3).map(x => x.term);
    if (others.length >= 1) qs.push({type:'mc', question:`Which term matches: “${d.def}”?`, choices:[d.term, ...others], answer:0, explanation:`${d.term}: ${d.def}`});
    else qs.push({type:'short', question:`What term means: “${d.def}”?`, answer:d.term, explanation:`${d.term}: ${d.def}`});
  });
  return shuffle([...qs, ...shuffle(maths)]).slice(0, n);
}

/* ---------- boot ---------- */
async function boot(){
  if (window.NTStorage){ try { await window.NTStorage.ready } catch {} }
  const use = n => { try { return window.claude && window.claude.use ? window.claude.use(n).catch(() => null) : Promise.resolve(null) } catch { return Promise.resolve(null) } };
  use('sample').then(s => { S.sample = s || null; if (S.view.name === 'notebook'){ if (S.aiOpen) renderAI(); if (S.tab !== 'notes') renderTab(); else updateBadge() } });
  use('downloads').then(d => { S.downloads = d || null });
  use('assets').then(a => { S.assets = a || null });
  Promise.all([use('dictation'), use('tts')]).then(([d, t]) => { Ink.initVoice(d || null, t || null); if (S.view.name === 'notebook' && S.tab === 'notes' && (d || t)) renderNotes() });
  const {items, ink, seeded} = await Store.init();
  items.forEach(it => { if (it && it.id && it.type) S.items.set(it.id, it) });
  ink.forEach(([k, s]) => { if (Array.isArray(s)) S.ink.set(k, s) });
  if (!items.length && !seeded) seed();
  if (S.mode === 'cloud'){ const [db, user, room] = await Promise.all([use('db'), use('user'), use('room')]); await Share.init(db, user, room) }
  setSidebar(S.sbOpen, true);
  route();
}
let lastW = window.innerWidth;
window.addEventListener('resize', () => { if (S.view.name === 'notebook' && S.tab === 'notes'){ const nb = curNb(); if (nb) Zoom.apply(nb, false) } if (lastW >= 1000 && window.innerWidth < 1000 && S.sbOpen) setSidebar(false, true); lastW = window.innerWidth; measureTop(); if (S.view.name === 'notebook' && S.tab === 'notes'){ autosize(); scheduleOverlay() } });
