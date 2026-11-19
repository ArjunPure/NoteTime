"use strict";
/* NoteTime extras: fonts, error reporting, unified undo/redo, version history, zoom, touch gestures, video transcripts. */

/* ---------- fonts ---------- */
const FONTS = [
  ['hand', 'Handwritten', 'Kalam', .6, 'cursive'],
  ['script', 'Script', 'Caveat', .74, 'cursive'],
  ['neat', 'Neat print', 'Patrick Hand', .62, 'cursive'],
  ['doodle', 'Doodle', 'Indie Flower', .58, 'cursive'],
  ['marker', 'Marker', 'Permanent Marker', .5, 'cursive'],
  ['rounded', 'Rounded', 'Nunito', .5, 'ui-rounded, sans-serif'],
  ['clean', 'Clean', 'Inter', .5, 'ui-sans-serif, system-ui, sans-serif'],
  ['serif', 'Book', 'Merriweather', .45, 'Georgia, serif'],
  ['easy', 'Easy to read', 'Atkinson Hyperlegible', .52, 'ui-sans-serif, sans-serif'],
  ['comic', 'Comic', 'Comic Neue', .54, '"Comic Sans MS", cursive'],
  ['mono', 'Typewriter', 'JetBrains Mono', .44, 'ui-monospace, monospace']
];
const fontOf = k => FONTS.find(f => f[0] === k) || FONTS[0];
(function(){
  const st = document.createElement('style');
  st.textContent = FONTS.map(([k, , fam, f, fb]) => `.f-${k}{--ff:"${fam}",${fb};--fs:calc(var(--lh) * ${f})}`).join('\n');
  document.head.appendChild(st);
})();

/* ---------- visible errors instead of silent failures ---------- */
function reportErr(err){
  const m = (err && (err.message || err.code)) || String(err || '');
  if (!m || /ResizeObserver loop|Script error\.?$|cancelled|AbortError/i.test(m)) return;
  console.error(err);
  let b = $('#errbar');
  if (!b){ b = document.createElement('div'); b.id = 'errbar'; b.className = 'errbar'; b.setAttribute('role', 'alert'); document.body.appendChild(b) }
  b.innerHTML = `<span><b>Something went wrong.</b> ${esc(m.slice(0, 160))}. Your saved notes are safe.</span><button class="btn" id="err-retry">Reload this view</button><button class="iconbtn sm" id="err-x" aria-label="Dismiss">${I.close}</button>`;
  $('#err-retry').onclick = () => { b.remove(); try { render() } catch (e){ console.error(e) } };
  $('#err-x').onclick = () => b.remove();
}
window.addEventListener('error', e => reportErr(e.error || e.message));
window.addEventListener('unhandledrejection', e => reportErr(e.reason));

/* ---------- unified undo / redo (typing and ink) ---------- */
const Hist = (() => {
  const map = new Map();
  const get = key => { if (!map.has(key)) map.set(key, {u:[], r:[]}); return map.get(key) };
  let burst = null, burstT = 0, prevText = null;
  function curKey(){ const nb = curNb(); if (!nb || S.tab !== 'notes') return null; const p = nb.pages[S.page]; return p ? nb.id + '_' + p.id : null }
  function textEntry(before, after){
    let p = 0; while (p < before.length && p < after.length && before[p] === after[p]) p++;
    let s = 0; while (s < before.length - p && s < after.length - p && before[before.length - 1 - s] === after[after.length - 1 - s]) s++;
    return {k:'text', start:p, del:before.slice(p, before.length - s), ins:after.slice(p, after.length - s)};
  }
  function push(key, e){ if (!key || !e) return; if (e.k === 'text' && !e.del && !e.ins) return; const h = get(key); h.u.push(e); if (h.u.length > 300) h.u.shift(); h.r = []; buttons() }
  function resetText(text){ commit(); prevText = text }
  function onInput(text, now){
    if (prevText === null) prevText = text;
    if (!burst) burst = {before:prevText, key:curKey()};
    prevText = text;
    clearTimeout(burstT); burstT = setTimeout(commit, now ? 0 : 700);
    buttons();
  }
  function commit(){
    clearTimeout(burstT); if (!burst) return;
    const b = burst; burst = null;
    if (prevText !== null && b.before !== prevText) push(b.key, textEntry(b.before, prevText));
  }
  function applyText(e, inverse){
    const nb = curNb(); if (!nb) return false;
    const page = nb.pages[S.page]; const from = inverse ? e.ins : e.del, to = inverse ? e.del : e.ins, t = page.text;
    let pos = Math.min(e.start, t.length);
    if (t.substr(pos, from.length) !== from){
      if (!from) pos = Math.min(e.start, t.length);
      else { let best = -1, bd = Infinity, i = t.indexOf(from); while (i >= 0){ const d = Math.abs(i - e.start); if (d < bd){ bd = d; best = i } i = t.indexOf(from, i + 1) } if (best < 0) return false; pos = best }
    }
    page.text = t.slice(0, pos) + to + t.slice(pos + from.length);
    const ta = $('#ed-ta');
    if (ta){ ta.value = page.text; prevText = page.text; ta.focus({preventScroll:true}); ta.setSelectionRange(pos + to.length, pos + to.length); autosize(); scheduleOverlay() }
    Store.put(nb, 300);
    return true;
  }
  function apply(e, inverse){
    if (e.k === 'text') return applyText(e, inverse);
    if (e.k === 'ink'){ Ink.applyOp(inverse ? {rm:e.op.add, add:e.op.rm} : e.op); return true }
    if (e.k === 'multi'){ let ok = true; (inverse ? e.list.slice().reverse() : e.list).forEach(x => { if (apply(x, inverse) === false) ok = false }); return ok }
    return true;
  }
  function undo(){
    const nb = curNb(); if (!nb || isView(nb)) return;
    commit(); const key = curKey(); if (!key) return;
    const h = get(key); if (!h.u.length){ flash('Nothing to undo'); return }
    const e = h.u.pop(); if (apply(e, true) === false) toast("Couldn't undo that change because the text around it changed.");
    h.r.push(e); buttons(); flash('Undo');
  }
  function redo(){
    const nb = curNb(); if (!nb || isView(nb)) return;
    commit(); const key = curKey(); if (!key) return;
    const h = get(key); if (!h.r.length){ flash('Nothing to redo'); return }
    const e = h.r.pop(); apply(e, false); h.u.push(e); buttons(); flash('Redo');
  }
  function buttons(){
    const key = curKey(), h = key && get(key);
    const u = $('#tb-undo'), r = $('#tb-redo');
    if (u) u.disabled = !(h && (h.u.length || burst));
    if (r) r.disabled = !(h && h.r.length);
  }
  function flash(t){
    $$('.gflash').forEach(x => x.remove());
    const d = document.createElement('div'); d.className = 'gflash'; d.textContent = t; document.body.appendChild(d);
    setTimeout(() => d.remove(), 700);
  }
  document.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey) || S.view.name !== 'notebook' || S.tab !== 'notes') return;
    const k = e.key.toLowerCase();
    const inOther = e.target.matches && e.target.matches('input, textarea, [contenteditable]') && e.target.id !== 'ed-ta';
    if (inOther) return;
    if (k === 'z' && !e.shiftKey){ e.preventDefault(); undo() }
    else if ((k === 'z' && e.shiftKey) || k === 'y'){ e.preventDefault(); redo() }
  });
  return {push, textEntry, onInput, commit, resetText, undo, redo, buttons, flash};
})();

/* ---------- version history ---------- */
const Versions = (() => {
  const LS = 'inkwell.ver.';
  let verAt = {}; try { verAt = JSON.parse(lsGet('inkwell.verAt') || '{}') } catch {}
  const timers = {}, openedSet = new Set();
  function col(nb){
    if (nb.shared && Share.db) return Share.db.collection(`sh/${nb.id}/versions`);
    if (S.mode === 'cloud' && Store.db && Store.uid) return Store.db.collection(`data/users/${Store.uid}/vers_${nb.id}/list`);
    return null;
  }
  function build(nb, label){
    const v = {id:'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at:Date.now(), by:Share.myId || null, label, name:nb.name,
      pages:nb.pages.map(p => ({id:p.id, text:p.text, voice:p.voice || [], media:(p.media || []).map(m => ({...m}))})), ink:{}};
    nb.pages.forEach(p => { const s = S.ink.get(nb.id + '_' + p.id); if (s && s.length) v.ink[p.id] = s });
    if (JSON.stringify(v).length > 240000){ v.ink = {}; v.inkDropped = true }
    if (JSON.stringify(v).length > 240000){ v.pages.forEach(p => { p.media = p.media.map(m => ({...m, transcript:[]})) }); v.trimmed = true }
    return v;
  }
  async function save(nb, label){
    if (!nb || (nb.shared && Share.readOnly())) return null;
    const v = build(nb, label);
    verAt[nb.id] = Date.now(); lsSet('inkwell.verAt', JSON.stringify(verAt));
    try {
      const c = col(nb);
      if (c) await c.doc(v.id).set(JSON.parse(JSON.stringify(v)));
      else if (!lsSet(LS + nb.id + '.' + v.id, JSON.stringify(v))) throw new Error('This browser is out of storage space for versions');
      prune(nb);
      return v;
    } catch (e){ console.warn(e); return null }
  }
  async function list(nb){
    const c = col(nb); let arr = [];
    if (c){ const snap = await withTimeout(c.limit(200).get(), 10000); arr = snap.docs.map(d => dataOf(d)).filter(Boolean) }
    else { try { const L = LSO(); for (let i = 0; i < L.length; i++){ const k = L.key(i); if (k && k.startsWith(LS + nb.id + '.')){ try { arr.push(JSON.parse(lsGet(k))) } catch {} } } } catch {} }
    return arr.filter(v => v && v.at).sort((a, b) => b.at - a.at);
  }
  async function prune(nb){ try { const arr = await list(nb); arr.slice(col(nb) ? 40 : 12).forEach(v => remove(nb, v)) } catch {} }
  function remove(nb, v){ const c = col(nb); if (c) c.doc(v.id).delete().catch(() => {}); else lsDel(LS + nb.id + '.' + v.id) }
  function touch(nb){
    if (!nb || nb.type !== 'notebook' || nb.example) return;
    if (Date.now() - (verAt[nb.id] || 0) < 5 * 60e3) return;
    clearTimeout(timers[nb.id]);
    timers[nb.id] = setTimeout(() => { if ((verAt[nb.id] || 0) < (nb.updatedAt || 0) && S.items.get(nb.id) === nb) save(nb, 'Auto-saved') }, 20000);
  }
  function opened(nb){
    if (!nb || nb.example || openedSet.has(nb.id)) return; openedSet.add(nb.id);
    if ((verAt[nb.id] || 0) < (nb.updatedAt || 0) && nb.pages.some(p => p.text || (S.ink.get(nb.id + '_' + p.id) || []).length)) save(nb, 'When you opened it');
  }
  async function restore(nb, v){
    await save(nb, 'Before restoring');
    const old = nb.pages.map(p => p.id);
    nb.pages = v.pages.map(p => ({id:p.id, text:p.text || '', voice:JSON.parse(JSON.stringify(p.voice || [])), media:JSON.parse(JSON.stringify(p.media || []))}));
    old.filter(id => !nb.pages.some(p => p.id === id)).forEach(id => Store.removeInk(nb.id + '_' + id));
    if (!v.inkDropped) nb.pages.forEach(p => Store.putInk(nb.id + '_' + p.id, JSON.parse(JSON.stringify((v.ink || {})[p.id] || [])), 50));
    Store.put(nb, 50); S.page = 0;
  }
  function asCopy(nb, v){
    const c = makeNotebook({name:`${nb.name} (${new Date(v.at).toLocaleDateString(undefined, {month:'short', day:'numeric'})} version)`, cover:nb.cover, settings:JSON.parse(JSON.stringify(nb.settings)), pages:[]});
    c.pages = v.pages.map(p => { const np = {id:uid(), text:p.text || '', voice:JSON.parse(JSON.stringify(p.voice || [])), media:JSON.parse(JSON.stringify(p.media || []))}; Store.putInk(c.id + '_' + np.id, JSON.parse(JSON.stringify((v.ink || {})[p.id] || [])), 50); return np });
    Store.put(c, 50); return c;
  }
  return {save, list, restore, touch, opened, asCopy};
})();

function whenText(t){
  const d = new Date(t), now = new Date();
  const time = d.toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'});
  if (d.toDateString() === now.toDateString()) return 'Today, ' + time;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday, ' + time;
  return d.toLocaleDateString(undefined, {month:'short', day:'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric'}) + ', ' + time;
}
async function openVersions(nb){
  closeSheet();
  const scrim = document.createElement('div'); scrim.className = 'sheet-scrim'; scrim.onclick = closeSheet;
  const sh = document.createElement('aside'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-label', 'Version history');
  const canSave = !(nb.shared && Share.readOnly());
  sh.innerHTML = `<div class="sheet-head"><h3>Version history</h3><button class="iconbtn" id="vh-x" aria-label="Close version history">${I.close}</button></div>
    <div class="sheet-body">
      <p class="muted" style="margin:0">NoteTime saves a version when you open a notebook and every few minutes while you work. Restoring a version keeps your current notes as a version too.</p>
      ${canSave ? `<div class="linkrow"><input class="input" id="vh-name" placeholder="Name this version, e.g. Before the exam" maxlength="60"><button class="btn primary" id="vh-save">Save version</button></div>` : ''}
      <div id="vh-list"><div class="thinking"><span class="spin"></span>Loading versions…</div></div>
    </div>`;
  document.body.append(scrim, sh);
  requestAnimationFrame(() => sh.classList.add('open'));
  $('#vh-x', sh).onclick = closeSheet;
  const load = async () => {
    let arr = [];
    try { arr = await Versions.list(nb) } catch (e){ $('#vh-list', sh).innerHTML = `<p class="warn">Couldn't load versions. Check your connection and try again.</p>`; return }
    const el = $('#vh-list', sh); if (!el) return;
    if (!arr.length){ el.innerHTML = `<p class="note">No versions yet. One is saved after you make changes, or press Save version.</p>`; return }
    el.innerHTML = `<div class="ver-list">${arr.map((v, i) => {
      const words = v.pages.reduce((n, p) => n + ((p.text || '').match(/\S+/g) || []).length, 0);
      const strokes = Object.values(v.ink || {}).reduce((n, s) => n + s.length, 0);
      const who = !v.by ? '' : v.by === Share.myId ? ' · you' : ' · a collaborator';
      return `<div class="ver"><div class="vmeta"><b>${esc(v.label || 'Version')}</b><span>${esc(whenText(v.at))}${who}</span><span class="note">${v.pages.length} page${v.pages.length === 1 ? '' : 's'} · ${words} words${strokes ? ` · ${strokes} pen strokes` : ''}${v.inkDropped ? ' · handwriting too large to keep' : ''}</span></div>
        <div class="vacts"><button class="btn" data-vprev="${i}">Preview</button>${canSave ? `<button class="btn" data-vres="${i}">Restore</button>` : ''}</div></div>`;
    }).join('')}</div>`;
    $$('[data-vprev]', el).forEach(b => b.onclick = () => previewVersion(nb, arr[+b.dataset.vprev]));
    $$('[data-vres]', el).forEach(b => b.onclick = () => confirmRestore(nb, arr[+b.dataset.vres]));
  };
  const sv = $('#vh-save', sh);
  if (sv) sv.onclick = async () => { sv.disabled = true; const v = await Versions.save(nb, $('#vh-name', sh).value.trim() || 'Saved by you'); sv.disabled = false; toast(v ? 'Version saved' : "Couldn't save a version. Check your connection."); $('#vh-name', sh).value = ''; load() };
  load();
}
function confirmRestore(nb, v){
  modal({title:'Restore this version?', body:`<p class="muted" style="margin:0">The notebook goes back to how it was ${esc(whenText(v.at).toLowerCase())}. Your current notes are saved as a version first, so you can switch back.${nb.shared ? ' Everyone working in this shared notebook sees the change.' : ''}</p>`,
    actions:[{label:'Cancel'}, {label:'Restore', kind:'primary', run: async () => { await Versions.restore(nb, v); closeSheet(); renderNotebook(); toast(`Restored the version from ${whenText(v.at)}`) }}]});
}
async function previewVersion(nb, v){
  let idx = 0;
  const tmp = {...nb, id:'preview', pages:v.pages};
  const back = modal({title:`${v.label || 'Version'} · ${whenText(v.at)}`, wide:true,
    body:`<div class="seg" id="vp-pages">${v.pages.map((p, i) => `<button class="${i === 0 ? 'on' : ''}" data-i="${i}">Page ${i + 1}</button>`).join('')}</div><div class="vprev" id="vp-box"><div class="thinking"><span class="spin"></span>Drawing the page…</div></div>`,
    actions:[{label:'Close'}, {label:'Save as new notebook', run:() => { const c = Versions.asCopy(nb, v); toast(`Saved “${c.name}”`); render() }}, ...(!(nb.shared && Share.readOnly()) ? [{label:'Restore', kind:'primary', run:() => { closeModal(); confirmRestore(nb, v); return false }}] : [])],
    onMount: b => { $('#vp-pages', b).onclick = e => { const x = e.target.closest('[data-i]'); if (!x) return; idx = +x.dataset.i; $$('#vp-pages button', b).forEach(y => y.classList.toggle('on', y === x)); draw() } }});
  async function draw(){
    const box = $('#vp-box', back); if (!box) return;
    const c = await IO.renderPage(tmp, v.pages[idx], {lines:true, ink:true, voice:true, minLines:false, scale:1.5, strokes:(v.ink || {})[v.pages[idx].id] || []});
    box.innerHTML = ''; c.style.width = '100%'; c.style.height = 'auto'; box.appendChild(c);
  }
  draw();
}

/* ---------- zoom ---------- */
const Zoom = (() => {
  const key = nb => 'notetime.zoom.' + nb.id;
  const get = nb => { const z = parseFloat(lsGet(key(nb))); return z >= 0.5 && z <= 3 ? z : 1 };
  function apply(nb, keep){
    const col = $('#paper-col'), wrap = $('#paper-scroll'), paper = $('#paper'); if (!col || !paper || !wrap) return;
    const z = get(nb), avail = wrap.clientWidth || 840, base = Math.min(840, avail);
    let anchor = null;
    if (keep){ const r = col.getBoundingClientRect(); anchor = {fy:(innerHeight / 2 - r.top) / Math.max(1, r.height), fx:(wrap.scrollLeft + wrap.clientWidth / 2) / Math.max(1, col.offsetWidth)} }
    col.style.width = Math.round(base * z) + 'px';
    paper.style.setProperty('--z', z);
    wrap.classList.toggle('zoomed', base * z > avail + 1);
    autosize(); Ink.refresh(); renderOverlay();
    if (anchor){ const r2 = col.getBoundingClientRect(); window.scrollBy(0, r2.top + anchor.fy * r2.height - innerHeight / 2); wrap.scrollLeft = anchor.fx * col.offsetWidth - wrap.clientWidth / 2 }
    const l = $('#zoom-pct'); if (l) l.textContent = Math.round(z * 100) + '%';
  }
  function set(nb, z, keep = true){ z = Math.max(0.5, Math.min(3, Math.round(z * 100) / 100)); lsSet(key(nb), String(z)); apply(nb, keep) }
  const barHtml = () => `<div class="zoombar" id="zoombar" role="group" aria-label="Zoom"><button class="zb" id="zm-out" aria-label="Zoom out" title="Zoom out">−</button><button class="zb zpct" id="zoom-pct" title="Back to 100%">100%</button><button class="zb" id="zm-in" aria-label="Zoom in" title="Zoom in">+</button></div>`;
  function wire(nb){
    $('#zm-out').onclick = () => set(nb, get(nb) - 0.1);
    $('#zm-in').onclick = () => set(nb, get(nb) + 0.1);
    $('#zoom-pct').onclick = () => set(nb, 1);
    $('#paper-scroll').addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); set(nb, get(nb) * (e.deltaY < 0 ? 1.08 : 1 / 1.08)) }, {passive:false});
  }
  return {get, set, apply, barHtml, wire};
})();

/* ---------- touch gestures: pinch to zoom, two-finger double-tap undo, three-finger double-tap redo ---------- */
const Gestures = (() => {
  let lastTap = {n:0, t:0};
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  function wire(nb){
    const el = $('#paper-scroll'); if (!el) return;
    let g = null, raf = 0, pending = null;
    el.addEventListener('touchstart', e => {
      if (e.touches.length >= 2){
        if (!g) g = {n:e.touches.length, t:Date.now(), d0:dist(e.touches[0], e.touches[1]), z0:Zoom.get(nb), moved:false};
        else g.n = Math.max(g.n, e.touches.length);
        Ink.cancelActive(); e.preventDefault();
      }
    }, {passive:false});
    el.addEventListener('touchmove', e => {
      if (!g || e.touches.length < 2) return;
      e.preventDefault();
      const d = dist(e.touches[0], e.touches[1]);
      if (g.moved || Math.abs(d - g.d0) > 14){
        g.moved = true;
        if (g.n === 2){ pending = g.z0 * d / g.d0; if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (pending) Zoom.set(nb, pending) }) }
      }
    }, {passive:false});
    el.addEventListener('touchend', e => {
      if (!g || e.touches.length) return;
      const quick = !g.moved && Date.now() - g.t < 350, n = g.n >= 3 ? 3 : 2;
      g = null;
      if (!quick) return;
      const now = Date.now();
      if (lastTap.n === n && now - lastTap.t < 450){ lastTap = {n:0, t:0}; if (n === 2) Hist.undo(); else Hist.redo() }
      else lastTap = {n, t:now};
    }, {passive:false});
    el.addEventListener('touchcancel', () => { g = null });
  }
  return {wire};
})();

/* ---------- video transcript panel on a page ---------- */
function fmtTime(s){ s = Math.max(0, Math.round(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0') }
function mediaHtml(page, view){
  return (page.media || []).map(m => `<div class="media-card ${m.open === false ? 'closed' : ''}" data-media="${esc(m.id)}">
    <div class="mc-head">${ic('video')}<b>${esc(m.name)}</b><span class="note">${m.duration ? fmtTime(m.duration) + ' · ' : ''}${(m.transcript || []).length ? (m.transcript.length + ' transcript lines') : 'no transcript'}</span><span class="grow"></span>
      <button class="btn ghost" data-mtoggle>${m.open === false ? 'Show' : 'Hide'}</button>${view ? '' : `<button class="iconbtn sm" data-mdel aria-label="Remove video and transcript" title="Remove video and transcript">${I.trash}</button>`}</div>
    <div class="mc-body">
      ${m.url ? `<video class="mc-video" controls playsinline preload="metadata" src="${esc(m.url)}"></video>` : `<div class="note">The video file itself wasn't kept (only videos up to 20 MB can be stored), but everything it said is in the transcript below.</div>`}
      ${m.summary ? `<p class="mc-sum">${esc(m.summary)}</p>` : ''}
      ${(m.transcript || []).length ? `<div class="mc-tools"><input class="input" placeholder="Search what was said" data-msearch aria-label="Search the transcript">${view ? '' : '<button class="btn" data-minsert>Add transcript to page</button>'}<button class="btn" data-mcopy>Copy</button></div>
      <div class="mc-tr">${m.transcript.map(l => `<button class="tl" data-t="${l.t}"><span class="ts">${fmtTime(l.t)}</span><span class="tx">${esc(l.text)}</span></button>`).join('')}</div>` : '<div class="note">There is no transcript for this video.</div>'}
    </div></div>`).join('');
}
function wireMedia(nb, page){
  $$('.media-card').forEach(card => {
    const m = (page.media || []).find(x => x.id === card.dataset.media); if (!m) return;
    const vid = $('.mc-video', card);
    $('[data-mtoggle]', card).onclick = () => { m.open = m.open === false; card.classList.toggle('closed', m.open === false); $('[data-mtoggle]', card).textContent = m.open === false ? 'Show' : 'Hide' };
    const del = $('[data-mdel]', card);
    if (del) del.onclick = () => modal({title:'Remove this video?', body:'<p class="muted" style="margin:0">The video and its transcript are removed from this page. Your typed notes stay.</p>', actions:[{label:'Cancel'}, {label:'Remove', kind:'danger solid', run:() => { page.media = page.media.filter(x => x !== m); Store.put(nb, 50); renderNotes() }}]});
    $$('.tl', card).forEach(b => b.onclick = () => { if (vid){ vid.currentTime = +b.dataset.t; vid.play().catch(() => {}) } });
    const q = $('[data-msearch]', card);
    if (q) q.oninput = () => { const v = q.value.trim().toLowerCase(); $$('.tl', card).forEach(b => { b.hidden = !!v && !b.textContent.toLowerCase().includes(v) }) };
    const ins = $('[data-minsert]', card);
    if (ins) ins.onclick = () => {
      const before = page.text;
      page.text = page.text.replace(/\s*$/, '') + `\n\n# Transcript: ${m.name}\n` + m.transcript.map(l => `[${fmtTime(l.t)}] ${l.text}`).join('\n') + '\n';
      Hist.push(nb.id + '_' + page.id, Hist.textEntry(before, page.text));
      Store.put(nb, 50); renderNotes(); toast('Added the transcript to this page');
    };
    const cp = $('[data-mcopy]', card);
    if (cp) cp.onclick = () => navigator.clipboard?.writeText(m.transcript.map(l => `[${fmtTime(l.t)}] ${l.text}`).join('\n')).then(() => toast('Transcript copied'), () => toast("Couldn't copy. Select the text instead."));
    if (vid) vid.ontimeupdate = () => {
      const t = vid.currentTime; let cur = null;
      $$('.tl', card).forEach(b => { if (+b.dataset.t <= t) cur = b; b.classList.remove('now') });
      if (cur){ cur.classList.add('now') }
    };
  });
}
