"use strict";
/* NoteTime sharing: shared notebooks in the artifact's shared store, live sync, merge, and presence. */
const Share = (() => {
  const LINK = 'https://claude.ai/artifact/SGYi3DxfG5tmDZ2u5G5UTs';
  const META_KEYS = ['id','type','name','cover','settings','createdAt','updatedAt','overview','quiz','quizHistory','source','owner','sharedAt'];
  let db = null, user = null, room = null, myId = null, canWrite = true;
  let openId = null, unsubs = [], nbRoom = null, peerUnsub = null, metaUnsub = null;
  const loaded = new Set(), awaiting = new Set(), readyIds = new Set();
  const base = new Map(), sent = new Map(), lastJ = new Map(), lastPages = new Map();
  const inkSynced = new Map(), inkPend = new Map(), stash = new Map();
  const timers = new Map(), inflight = new Map(), queued = new Map();
  const profiles = {}; let peers = [];
  const sid = () => Math.random().toString(36).slice(2, 10);

  const available = () => !!db && S.mode === 'cloud';
  const readOnly = () => canWrite === false;
  const busy = () => timers.size + inflight.size;
  const isReady = nb => !nb.shared || readyIds.has(nb.id);
  const isOwner = nb => !nb.owner || nb.owner === myId;
  const linkFor = nb => `${LINK}#nb-${nb.id}`;
  function remember(path, j){ const a = sent.get(path) || []; a.push(j); if (a.length > 8) a.shift(); sent.set(path, a) }
  function wasSent(path, j){ const a = sent.get(path); if (!a) return false; const i = a.lastIndexOf(j); if (i < 0) return false; a.splice(0, i + 1); return true }

  function send(path, data){
    if (inflight.has(path)){ queued.set(path, data); return }
    let p;
    try {
      const ref = db.doc(path);
      if (data === null) p = ref.delete();
      else { const j = JSON.stringify(data); remember(path, j); p = ref.set(JSON.parse(j)) }
    } catch (e){ console.warn(e); return }
    inflight.set(path, p); updateSaveState();
    p.then(() => { S.saveErr = false }).catch(e => {
      console.warn(e);
      if (e && e.code === 'not_granted'){ canWrite = false; toast('You can read shared notebooks but not edit them. Ask the owner of NoteTime for edit access.') }
      else if (e && e.code === 'invalid_argument') toast('This page is too big to share. Split it onto a new page.');
      else { S.saveErr = true; toast("Couldn't save to the shared notebook. Check your connection.") }
    }).finally(() => {
      inflight.delete(path); updateSaveState();
      if (queued.has(path)){ const d = queued.get(path); queued.delete(path); send(path, d) }
    });
  }

  /* ---------- merging ---------- */
  function region(b, x){
    let p = 0; while (p < b.length && p < x.length && b[p] === x[p]) p++;
    let s = 0; while (s < b.length - p && s < x.length - p && b[b.length - 1 - s] === x[x.length - 1 - s]) s++;
    return {start:p, end:b.length - s, text:x.slice(p, x.length - s)};
  }
  function merge3(b, mine, theirs){
    if (mine === b) return theirs;
    if (theirs === b || theirs === mine) return mine;
    const a = region(b, mine), r = region(b, theirs);
    if (a.end <= r.start && !(a.start === a.end && r.start === r.end && a.start === r.start)) return b.slice(0, a.start) + a.text + b.slice(a.end, r.start) + r.text + b.slice(r.end);
    if (r.end <= a.start && !(a.start === a.end && r.start === r.end && a.start === r.start)) return b.slice(0, r.start) + r.text + b.slice(r.end, a.start) + a.text + b.slice(a.end);
    if (a.start === a.end && r.start === r.end && a.start === r.start) return b.slice(0, a.start) + r.text + a.text + b.slice(a.start);
    return theirs.includes(a.text) ? theirs : mine;
  }

  /* ---------- writing ---------- */
  function metaOf(nb){ const m = {}; META_KEYS.forEach(k => { if (nb[k] !== undefined) m[k] = nb[k] }); m.pages = nb.pages.map(p => ({id:p.id})); return m }
  function write(nb, delay = 350){
    if (!available() || readOnly()) return;
    clearTimeout(timers.get(nb.id));
    timers.set(nb.id, setTimeout(() => { timers.delete(nb.id); flushNb(nb) }, delay));
    updateSaveState();
  }
  function flushNb(nb){
    if (!S.items.has(nb.id) || !nb.shared) return;
    const mp = 'sh/' + nb.id, m = metaOf(nb), mj = JSON.stringify(m);
    const ids = m.pages.map(p => p.id), prev = lastPages.get(nb.id) || ids;
    prev.filter(id => !ids.includes(id)).forEach(id => { send(`sh/${nb.id}/pages/${id}`, null); send(`sh/${nb.id}/ink/${id}`, null) });
    lastPages.set(nb.id, ids);
    if (mj !== lastJ.get(mp)){ lastJ.set(mp, mj); send(mp, m) }
    nb.pages.forEach(p => {
      if (awaiting.has(p.id)) return;
      loaded.add(p.id);
      const path = `sh/${nb.id}/pages/${p.id}`, d = {text:p.text, voice:p.voice || [], media:p.media || []}, j = JSON.stringify(d);
      if (j !== lastJ.get(path)){ lastJ.set(path, j); send(path, d) }
    });
  }
  function writeInk(nb, pid, delay = 250){
    if (!available() || readOnly()) return;
    const key = nb.id + '_' + pid;
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => { timers.delete(key); flushInk(nb, pid) }, delay));
    updateSaveState();
  }
  function flushInk(nb, pid){
    if (!S.items.has(nb.id) || !nb.shared) return;
    const key = nb.id + '_' + pid, strokes = S.ink.get(key) || [];
    trackPending(key);
    const path = `sh/${nb.id}/ink/${pid}`, d = {s:strokes}, j = JSON.stringify(d);
    if (j === lastJ.get(path)) return;
    lastJ.set(path, j); send(path, d);
  }
  function trackPending(key){
    const strokes = S.ink.get(key) || [];
    strokes.forEach(s => { if (!s.i) s.i = sid() });
    const synced = inkSynced.get(key) || new Set(), ids = new Set(strokes.map(s => s.i));
    const pend = inkPend.get(key) || {adds:new Set(), dels:new Set()};
    ids.forEach(i => { if (!synced.has(i)) pend.adds.add(i) });
    synced.forEach(i => { if (!ids.has(i)) pend.dels.add(i) });
    inkPend.set(key, pend);
    return pend;
  }
  function flushAll(){ [...timers.keys()].forEach(k => { clearTimeout(timers.get(k)); timers.delete(k); const nb = S.items.get(k); if (nb) flushNb(nb); else { const [n, p] = k.split('_'); const nb2 = S.items.get(n); if (nb2) flushInk(nb2, p) } }) }
  window.addEventListener('pagehide', flushAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) flushAll() });

  /* ---------- receiving ---------- */
  let renderT = 0;
  function softRender(){ clearTimeout(renderT); renderT = setTimeout(() => { if (S.view.name === 'home') render(); else renderSidebar() }, 120) }
  function onMeta(id, d){
    const path = 'sh/' + id;
    if (!d){
      const nb = S.items.get(id);
      if (nb && nb.shared){ S.items.delete(id); readyIds.delete(id); if (S.view.name === 'notebook' && S.view.id === id){ close(); toast('This notebook is no longer shared.'); go('') } else softRender() }
      return;
    }
    const j = JSON.stringify(d);
    if (wasSent(path, j)) return;
    let nb = S.items.get(id); const isNew = !nb;
    if (nb && !nb.shared) return;
    if (!nb) nb = {id, type:'notebook', shared:true, chat:[], pages:[], settings:{}};
    const before = JSON.stringify([nb.name, nb.cover, nb.settings, nb.pages.map(p => p.id)]);
    META_KEYS.forEach(k => { if (k in d) nb[k] = d[k] });
    nb.shared = true; nb.parentId = null; nb.type = 'notebook';
    nb.settings = Object.assign({paper:'lined', color:'auto', spacing:'medium', font:'hand', math:true, answers:true, angles:'deg', colors:true}, nb.settings);
    nb.pages = (d.pages || []).map(pp => nb.pages.find(p => p.id === pp.id) || newPage(nb, pp.id));
    if (!nb.pages.length) nb.pages = [newPage(nb, sid())];
    S.items.set(id, nb); lastJ.set(path, j); lastPages.set(id, nb.pages.map(p => p.id));
    const after = JSON.stringify([nb.name, nb.cover, nb.settings, nb.pages.map(p => p.id)]);
    if (isNew || before !== after){
      if (S.view.name === 'notebook' && S.view.id === id){
        renderSidebar();
        const t = $('#nb-title'); if (t && document.activeElement !== t) t.value = nb.name;
        const pageIds = JSON.parse(before)[3].join(), nowIds = nb.pages.map(p => p.id).join();
        if (JSON.stringify(JSON.parse(before)[2]) !== JSON.stringify(nb.settings) || pageIds !== nowIds){ if (S.page >= nb.pages.length) S.page = nb.pages.length - 1; renderTab() }
      } else softRender();
    }
  }
  function newPage(nb, pid){
    const p = {id:pid, text:'', voice:[]};
    if (stash.has(pid)){ const d = stash.get(pid); stash.delete(pid); p.text = d.text || ''; p.voice = d.voice || []; p.media = d.media || []; base.set(pid, p.text); loaded.add(pid) }
    else if (openId === nb.id) awaiting.add(pid);
    return p;
  }
  function onPage(nb, pid, d){
    const path = `sh/${nb.id}/pages/${pid}`;
    const j = JSON.stringify({text:d.text || '', voice:d.voice || [], media:d.media || []});
    awaiting.delete(pid);
    const page = nb.pages.find(p => p.id === pid);
    if (!page){ stash.set(pid, d); return }
    if (wasSent(path, j)){ base.set(pid, d.text || ''); loaded.add(pid); return }
    if (!loaded.has(pid)){
      page.text = d.text || ''; page.voice = d.voice || []; page.media = d.media || []; base.set(pid, page.text); loaded.add(pid); lastJ.set(path, j);
      applyRemote(nb, pid); return;
    }
    const merged = merge3(base.get(pid) ?? '', page.text, d.text || '');
    base.set(pid, d.text || '');
    page.voice = d.voice || []; page.media = d.media || [];
    page.text = merged;
    lastJ.set(path, j);
    if (merged !== (d.text || '')) write(nb, 200);
    applyRemote(nb, pid);
  }
  function onInk(nb, pid, d){
    const key = nb.id + '_' + pid, path = `sh/${nb.id}/ink/${pid}`;
    const remote = (d && Array.isArray(d.s)) ? d.s : [];
    const rids = new Set(remote.map(s => s.i));
    const pend = inkSynced.has(key) ? trackPending(key) : inkPend.get(key);
    inkSynced.set(key, rids);
    if (pend){ [...pend.adds].forEach(i => { if (rids.has(i)) pend.adds.delete(i) }); [...pend.dels].forEach(i => { if (!rids.has(i)) pend.dels.delete(i) }) }
    const local = S.ink.get(key) || [];
    const merged = remote.filter(s => !(pend && pend.dels.has(s.i))).concat(local.filter(s => pend && pend.adds.has(s.i) && !rids.has(s.i)));
    S.ink.set(key, merged);
    lastJ.set(path, JSON.stringify({s:remote}));
    if (pend && (pend.adds.size || pend.dels.size)) writeInk(nb, pid, 150);
    Ink.remoteRefresh(key);
  }

  /* ---------- open / close ---------- */
  function open(nb){
    if (!available() || openId === nb.id) return;
    close(); openId = nb.id;
    nb.pages.forEach(p => { if (!loaded.has(p.id)) awaiting.add(p.id) });
    const onErr = e => { console.warn(e); toast("Lost the live connection to this shared notebook. Reopen it to try again.") };
    unsubs.push(db.collection(`sh/${nb.id}/pages`).onSnapshot(snap => {
      snap.docChanges().forEach(ch => { if (ch.type !== 'removed') onPage(nb, ch.doc.id, dataOf(ch.doc) || {}) });
      if (!readyIds.has(nb.id)){
        readyIds.add(nb.id);
        nb.pages.forEach(p => { awaiting.delete(p.id); if (!loaded.has(p.id)){ loaded.add(p.id); base.set(p.id, p.text) } });
        if (S.view.name === 'notebook' && S.view.id === nb.id) renderTab();
      }
    }, onErr));
    unsubs.push(db.collection(`sh/${nb.id}/ink`).onSnapshot(snap => {
      snap.docChanges().forEach(ch => onInk(nb, ch.doc.id, ch.type === 'removed' ? {s:[]} : dataOf(ch.doc)));
    }, onErr));
    joinRoom(nb);
  }
  function close(){
    flushAll();
    unsubs.forEach(u => { try { u() } catch {} }); unsubs = [];
    if (peerUnsub){ try { peerUnsub() } catch {} peerUnsub = null }
    if (nbRoom){ try { nbRoom.leave().catch(() => {}) } catch {} nbRoom = null }
    openId = null; peers = []; renderPeers();
  }
  async function joinRoom(nb){
    if (!room) return;
    try {
      const r = await room.join('nb-' + nb.id);
      if (openId !== nb.id){ r.leave().catch(() => {}); return }
      nbRoom = r;
      setPresence({page:S.page});
      peerUnsub = r.onPeers(ch => { peers = ch.peers.filter(p => !p.isMe && p.kind === 'viewer'); renderPeers() }, () => {});
    } catch (e){ console.warn(e) }
  }
  function setPresence(patch){ if (nbRoom) nbRoom.presence(patch).catch(() => {}) }
  function peerList(){
    const seen = new Map();
    peers.forEach(p => { const k = p.by || p.peer; if (!seen.has(k)) seen.set(k, p) });
    return [...seen.values()];
  }
  function nameOf(p){ const pr = p.by && profiles[p.by]; return (pr && pr.name) || (p.guest ? 'Guest' : 'Someone') }
  function colorOf(p){ const pr = p.by && profiles[p.by]; if (pr && pr.color) return pr.color; let h = 0; for (const c of (p.by || p.peer)) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 55% 45%)` }
  const asked = new Set();
  function ownerName(id){
    if (!id) return '';
    if (id === myId) return 'you';
    if (profiles[id]) return profiles[id].name || '';
    if (user && user.profiles && !asked.has(id)){ asked.add(id); user.profiles([id]).then(ps => { Object.assign(profiles, ps || {}); softRender() }).catch(() => {}) }
    return '';
  }
  function initials(n){ return n.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?' }
  function renderPeers(){
    const el = $('#peers'); if (!el) return;
    const list = peerList();
    const missing = list.map(p => p.by).filter(id => id && !profiles[id]);
    if (missing.length && user && user.profiles) user.profiles(missing).then(ps => { Object.assign(profiles, ps || {}); renderPeers() }).catch(() => {});
    el.innerHTML = list.slice(0, 5).map(p => `<span class="peer" style="background:${esc(colorOf(p))}" title="${esc(nameOf(p))} · page ${((p.presence && p.presence.page) || 0) + 1}">${esc(initials(nameOf(p)))}</span>`).join('') + (list.length > 5 ? `<span class="peer more">+${list.length - 5}</span>` : '');
    el.hidden = !list.length;
    const dl = $('#share-here'); if (dl) dl.innerHTML = herePeopleHtml();
  }
  function herePeopleHtml(){
    const list = peerList();
    if (!list.length) return '<span class="note">No one else has this notebook open right now.</span>';
    return list.map(p => `<div class="here"><span class="peer" style="background:${esc(colorOf(p))}">${esc(initials(nameOf(p)))}</span><span>${esc(nameOf(p))}</span><span class="note">on page ${((p.presence && p.presence.page) || 0) + 1}</span></div>`).join('');
  }

  /* ---------- publish / stop / copy ---------- */
  function publish(nb){
    if (!available()) return false;
    const keys = nb.pages.map(p => nb.id + '_' + p.id);
    keys.forEach(k => (S.ink.get(k) || []).forEach(s => { if (!s.i) s.i = sid() }));
    nb.shared = true; nb.owner = myId; nb.sharedAt = Date.now(); nb.parentId = null; nb.example = false;
    const m = metaOf(nb); lastJ.set('sh/' + nb.id, JSON.stringify(m)); send('sh/' + nb.id, m);
    lastPages.set(nb.id, nb.pages.map(p => p.id));
    nb.pages.forEach(p => {
      loaded.add(p.id); base.set(p.id, p.text);
      const path = `sh/${nb.id}/pages/${p.id}`, d = {text:p.text, voice:p.voice || [], media:p.media || []};
      lastJ.set(path, JSON.stringify(d)); send(path, d);
      const key = nb.id + '_' + p.id, s = S.ink.get(key) || [];
      inkSynced.set(key, new Set(s.map(x => x.i)));
      const ip = `sh/${nb.id}/ink/${p.id}`; lastJ.set(ip, JSON.stringify({s})); send(ip, {s});
    });
    readyIds.add(nb.id);
    Store.dropPrivate(['it_' + nb.id, ...keys.map(k => 'ink_' + k)]);
    return true;
  }
  function destroyRemote(nb){
    nb.pages.forEach(p => { send(`sh/${nb.id}/pages/${p.id}`, null); send(`sh/${nb.id}/ink/${p.id}`, null) });
    send('sh/' + nb.id, null);
  }
  function stop(nb){
    if (openId === nb.id) close();
    destroyRemote(nb);
    readyIds.delete(nb.id);
    nb.shared = false; delete nb.owner; delete nb.sharedAt;
    Store.put(nb, 50);
    nb.pages.forEach(p => { const k = nb.id + '_' + p.id; Store.putInk(k, S.ink.get(k) || [], 50) });
  }
  function copy(nb){
    const c = JSON.parse(JSON.stringify(nb));
    c.id = uid(); c.shared = false; delete c.owner; delete c.sharedAt; c.chat = []; c.name = nb.name + ' (my copy)'; c.parentId = null;
    c.pages = nb.pages.map(p => { const np = {id:uid(), text:p.text, voice:JSON.parse(JSON.stringify(p.voice || []))}; Store.putInk(c.id + '_' + np.id, JSON.parse(JSON.stringify(S.ink.get(nb.id + '_' + p.id) || [])), 50); return np });
    Store.put(c, 50);
    return c;
  }

  /* ---------- init ---------- */
  async function init(_db, _user, _room){
    db = _db; user = _user; room = _room;
    if (!db || S.mode !== 'cloud') return;
    try { myId = user ? await user.id() : null } catch {}
    try { const c = user && user.can ? await user.can('data.write') : null; canWrite = c !== false } catch {}
    try {
      const snap = await withTimeout(db.collection('sh').limit(500).get(), 8000);
      snap.docs.forEach(d => onMeta(d.id, dataOf(d)));
    } catch (e){ console.warn('Shared notebooks unavailable', e) }
    try { metaUnsub = db.collection('sh').limit(500).onSnapshot(snap => snap.docChanges().forEach(ch => onMeta(ch.doc.id, ch.type === 'removed' ? null : dataOf(ch.doc))), e => console.warn(e)) } catch (e){ console.warn(e) }
  }

  return {init, available, readOnly, isReady, isOwner, linkFor, write, writeInk, open, close, publish, stop, copy, destroyRemote, setPresence, busy, herePeopleHtml, renderPeers, ownerName, get openId(){ return openId }, get db(){ return db }, get myId(){ return myId }};
})();
