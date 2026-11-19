"use strict";
/* NoteTime standalone mode: when NoteTime runs as an installed app (not inside the hosted viewer),
   this supplies on-device storage, file saving, read-aloud, voice typing and NoteTime AI (with your own key). */
(() => {
  if (window.claude && window.claude.use) return; // running inside the hosted viewer: it provides everything
  window.NT_STANDALONE = true;

  /* ---------- storage: big data in IndexedDB, small preferences in localStorage ---------- */
  const BIG = /^inkwell\.(data\.|ink\.|ver\.)/;
  const map = new Map();
  let dbp = null;
  const openDb = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('notetime', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  }));
  const ls = (() => { try { return window.localStorage } catch { return null } })();
  const pending = new Map(); let flushT = 0;
  function flush(){
    flushT = 0; const batch = [...pending]; pending.clear();
    openDb().then(db => { const tx = db.transaction('kv', 'readwrite'); const st = tx.objectStore('kv'); batch.forEach(([k, v]) => v === null ? st.delete(k) : st.put(v, k)) }).catch(e => console.warn('Saving failed', e));
  }
  const queue = (k, v) => { pending.set(k, v); if (!flushT) flushT = setTimeout(flush, 120) };
  window.addEventListener('pagehide', () => { if (flushT){ clearTimeout(flushT); flush() } });
  const NTStorage = {
    ready: (async () => {
      try {
        const db = await openDb();
        await new Promise((res) => {
          const tx = db.transaction('kv', 'readonly'), st = tx.objectStore('kv'), req = st.openCursor();
          req.onsuccess = () => { const c = req.result; if (c){ map.set(c.key, c.value); c.continue() } else res() };
          req.onerror = () => res();
        });
        // one-time move of notebooks saved in browser storage by an earlier version
        if (ls) for (let i = ls.length - 1; i >= 0; i--){ const k = ls.key(i); if (k && BIG.test(k) && !map.has(k)){ const v = ls.getItem(k); map.set(k, v); queue(k, v) } }
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      } catch (e){ console.warn('On-device storage unavailable, using browser storage', e) }
    })(),
    getItem(k){ return BIG.test(k) ? (map.has(k) ? map.get(k) : (ls ? ls.getItem(k) : null)) : (ls ? ls.getItem(k) : null) },
    setItem(k, v){ v = String(v); if (BIG.test(k)){ map.set(k, v); queue(k, v); return } if (ls) ls.setItem(k, v) },
    removeItem(k){ if (BIG.test(k)){ map.delete(k); queue(k, null) } if (ls) ls.removeItem(k) },
    keys(){ const out = new Set(map.keys()); if (ls) for (let i = 0; i < ls.length; i++) out.add(ls.key(i)); return [...out] },
    get length(){ return this.keys().length },
    key(i){ return this.keys()[i] ?? null }
  };
  window.NTStorage = NTStorage;

  /* ---------- saving files ---------- */
  const downloads = {
    async save({filename, data}){
      const blob = data instanceof Blob ? data : new Blob([data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return {status:'saved'};
    }
  };

  /* ---------- read aloud ---------- */
  const tts = window.speechSynthesis ? (() => {
    const hs = new Set(); let speaking = false;
    const emit = (state, reason) => { speaking = state !== 'idle'; hs.forEach(h => h({state, reason})) };
    return {
      speak(what){
        speechSynthesis.cancel();
        const parts = (Array.isArray(what) ? what.map(l => l.text) : [what]).filter(Boolean);
        return new Promise((res, rej) => {
          if (!parts.length){ res({playedMs:0}); return }
          const t0 = Date.now(); emit('speaking');
          parts.forEach((p, i) => {
            const u = new SpeechSynthesisUtterance(p);
            if (i === parts.length - 1){ u.onend = () => { emit('idle', 'completed'); res({playedMs:Date.now() - t0}) } }
            u.onerror = e => { if (e.error === 'interrupted' || e.error === 'canceled'){ emit('idle', 'stopped'); rej({code:'stopped', reason:'stopped'}) } else { emit('idle', 'upstream_error'); rej({code:'unavailable'}) } };
            speechSynthesis.speak(u);
          });
        });
      },
      async stop(){ speechSynthesis.cancel(); emit('idle', 'viewer_stopped') },
      active: () => speaking,
      onState(h){ hs.add(h); return () => hs.delete(h) }
    };
  })() : null;

  /* ---------- voice typing ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const dictation = SR ? (() => {
    const P = new Set(), F = new Set(), ST = new Set(); let rec = null, on = false, stopReason = 'stopped';
    const state = (s, reason) => ST.forEach(h => h({state:s, reason}));
    return {
      start(){
        return new Promise((res, rej) => {
          try {
            rec = new SR(); rec.continuous = true; rec.interimResults = true; rec.lang = navigator.language || 'en-US';
            stopReason = 'stopped';
            rec.onstart = () => { on = true; state('listening'); res() };
            rec.onresult = e => {
              let interim = '';
              for (let i = e.resultIndex; i < e.results.length; i++){ const r = e.results[i]; if (r.isFinal) F.forEach(h => h({text:r[0].transcript})); else interim += r[0].transcript }
              P.forEach(h => h({text:interim}));
            };
            rec.onerror = e => { if (e.error === 'not-allowed' || e.error === 'service-not-allowed'){ stopReason = 'not_granted'; if (!on) rej({code:'not_granted'}) } else if (e.error !== 'no-speech' && e.error !== 'aborted') stopReason = 'upstream_error' };
            rec.onend = () => { on = false; state('idle', stopReason) };
            rec.start();
          } catch (e){ rej({code:'unavailable', message:String(e)}) }
        });
      },
      async stop(){ if (rec){ stopReason = 'viewer_stopped'; rec.stop() } },
      active: () => on,
      onPartial(h){ P.add(h); return () => P.delete(h) },
      onFinal(h){ F.add(h); return () => F.delete(h) },
      onState(h){ ST.add(h); return () => ST.delete(h) }
    };
  })() : null;

  /* ---------- NoteTime AI with the user's own key ---------- */
  const KEY = 'notetime.aikey';
  const SDK_URL = 'https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.5.0/+esm';
  let clientP = null, clientKey = null;
  const getKey = () => { try { return ls && ls.getItem(KEY) || '' } catch { return '' } };
  async function client(){
    const k = getKey(); if (!k) throw {code:'no_key', message:'Add your AI key in Settings to use NoteTime AI.'};
    if (!clientP || clientKey !== k){
      clientKey = k;
      clientP = import(SDK_URL).then(m => new m.default({apiKey:k, dangerouslyAllowBrowser:true}));
    }
    return clientP;
  }
  const toB64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob) });
  async function buildMessages(input, images){
    let msgs = typeof input === 'string' ? [{role:'user', content:input}] : input.map(m => ({role:m.role, content:m.content}));
    // merge consecutive turns with the same role, as the API expects alternating roles
    msgs = msgs.reduce((out, m) => { const last = out[out.length - 1]; if (last && last.role === m.role) last.content += '\n\n' + m.content; else out.push({...m}); return out }, []);
    if (images && images.length){
      const last = msgs[msgs.length - 1];
      const blocks = [];
      for (const img of images){ blocks.push({type:'image', source:{type:'base64', media_type:img.type && /^image\/(png|jpeg|webp|gif)$/.test(img.type) ? img.type : 'image/jpeg', data:await toB64(img)}}) }
      blocks.push({type:'text', text:last.content});
      last.content = blocks;
    }
    return msgs;
  }
  function mapErr(e){
    if (e && e.code && !e.status) return e;
    const name = (e && e.constructor && e.constructor.name) || '';
    if (/Abort/.test(name) || (e && e.name === 'AbortError')) return {code:'cancelled', message:'Stopped.'};
    if (e && e.status === 401) return {code:'bad_key', message:'The AI key was rejected. Check it in Settings.'};
    if (e && e.status === 429) return {code:'rate_limited', message:'Too many requests. Wait a moment.'};
    if (e && e.status === 400 && /prompt is too long|too large/i.test(e.message || '')) return {code:'prompt_too_large', message:'Too long.'};
    if (e && e.status === 400) return {code:'invalid_request', message:(e.message || 'The request was rejected.')};
    return {code:'unavailable', message:(e && e.message) || "Couldn't reach NoteTime AI."};
  }
  async function sample(input, opts = {}){
    let text = '';
    try {
      const c = await client();
      const messages = await buildMessages(input, opts.images);
      const stream = c.beta.messages.stream({
        model:'claude-opus-5-5',
        max_tokens:16000,
        output_config:{effort: opts.modelTier === 'quick' ? 'low' : 'medium'},
        betas:['server-side-fallback-2026-07-01'],
        fallbacks:'default',
        messages
      }, {signal:opts.signal});
      stream.on('text', (delta, snapshot) => { text = snapshot; if (opts.onText) opts.onText({text:snapshot, delta}) });
      const msg = await stream.finalMessage();
      if (msg.stop_reason === 'refusal') throw {code:'refused', message:'NoteTime AI declined that request.'};
      text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
      return {text, truncated: msg.stop_reason === 'max_tokens'};
    } catch (e){ const m = mapErr(e); if (text) m.text = text; throw m }
  }
  sample.json = async (input, opts = {}) => {
    const p = typeof input === 'string' ? input + '\n\nReply with only the JSON value, no other text.' : input;
    const {text} = await sample(p, opts);
    const tryParse = s => { try { return JSON.parse(s) } catch { return undefined } };
    let v = tryParse(text.trim());
    if (v === undefined){ const m = text.match(/```(?:json)?\s*([\s\S]*?)```/); if (m) v = tryParse(m[1]) }
    if (v === undefined){ const a = text.search(/[\[{]/), b = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']')); if (a >= 0 && b > a) v = tryParse(text.slice(a, b + 1)) }
    if (v === undefined) throw {code:'invalid_json', message:'Unexpected reply', text};
    return v;
  };
  sample.limits = async () => ({maxPromptBytes:900000, images:{maxCount:20, maxInputBytes:5 * 1024 * 1024, mediaTypes:['image/png','image/jpeg','image/webp','image/gif']}});

  window.NTAI = {
    sample, hasKey: () => !!getKey(),
    setKey(k){ try { if (k) ls.setItem(KEY, k.trim()); else ls.removeItem(KEY) } catch {} clientP = null },
    async test(){ const {text} = await sample('Reply with the single word: ready', {modelTier:'quick'}); return text }
  };

  const caps = {downloads, tts, dictation};
  window.claude = {use: async name => name === 'sample' ? (getKey() ? sample : null) : (caps[name] || null)};

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(e => console.warn('Offline support unavailable', e));
})();
