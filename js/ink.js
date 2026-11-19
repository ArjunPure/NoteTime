"use strict";
/* NoteTime ink: pens, highlighter, eraser, lasso, voice notes, handwriting conversion, dockable toolbar. */
const Ink = (() => {
  const W0 = 840;
  const TI = {
    type:'<svg viewBox="0 0 24 24"><path d="M5 7V4h14v3M12 4v16M9 20h6"/></svg>',
    fountain:'<svg viewBox="0 0 24 24"><path d="M12 21 7.5 13 12 3l4.5 10z"/><path d="M12 13v-3"/><circle cx="12" cy="14" r="1"/></svg>',
    ball:'<svg viewBox="0 0 24 24"><path d="M4 20l1.2-3.8L17 4.4 19.6 7 7.8 18.8z"/><path d="M15 6.4 17.6 9"/></svg>',
    pencil:'<svg viewBox="0 0 24 24"><path d="M4 20l1-4 11-11 3 3-11 11z"/><path d="M14 7l3 3M5 16l3 3"/></svg>',
    marker:'<svg viewBox="0 0 24 24"><path d="M7 21h10M9 17h6l1.5-8L12 3 7.5 9z"/><path d="M9.5 12h5"/></svg>',
    highlighter:'<svg viewBox="0 0 24 24"><path d="M9 12.5 4 17.5V20h4l5-5"/><path d="m9 12.5 6.5-6.5 3.5 3.5L12.5 16z"/><path d="M14 21h7"/></svg>',
    eraser:'<svg viewBox="0 0 24 24"><path d="M8 20h12M4.5 15.5l9-9 6 6-7.5 7.5H8.5z"/><path d="m9.5 10.5 6 6"/></svg>',
    lasso:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="9" rx="8" ry="5" stroke-dasharray="3 2.5"/><path d="M7.5 13c-.8 2 0 3.5 1.5 4s1.5 2.5-.5 3.5"/></svg>',
    voice:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    math:'<svg viewBox="0 0 24 24"><path d="M17 5H7l6 7-6 7h10"/></svg>',
    undo:'<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    redo:'<svg viewBox="0 0 24 24"><path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg>',
    convert:'<svg viewBox="0 0 24 24"><path d="M3 15c1.5-3 2.5-3 3.5 0s2 3 3.5 0"/><path d="M14 5h7M17.5 5v9"/><path d="M13 19h8m-2.5-2.5L21 19l-2.5 2.5"/></svg>',
    speaker:'<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
    stop:'<svg viewBox="0 0 24 24"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/></svg>',
    play:'<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
    trash:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    close:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    more:'<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>',
    grip:'<svg viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/></svg>'
  };
  const PENS = ['fountain','ball','pencil','marker','highlighter'];
  const LABEL = {type:'Type', fountain:'Fountain pen', ball:'Ballpoint pen', pencil:'Pencil', marker:'Marker', highlighter:'Highlighter', eraser:'Eraser', lasso:'Lasso: select ink to move, recolor or convert', voice:'Voice note'};
  const PEN_COLORS = ['auto','#111111','#2747A8','#1E88E5','#D2352B','#E8710A','#1D7F50','#7B3FB8','#C2185B'];
  const HL_COLORS = ['#FFE14D','#86E08B','#7CC8FF','#FF9ECF','#FFB35C','#C9A7FF'];
  const SIZES = {fountain:[1.6,2.4,3.6], ball:[1.3,2,3], pencil:[1.4,2.2,3.4], marker:[4,6,9], highlighter:[14,20,28], eraser:[8,16,30]};
  const SYMBOLS = [['∫','∫ ','Integral'],['∫₀¹','∫₀¹ ','Definite integral'],['dx',' dx','dx'],['d/dx','d/dx ','Derivative'],['lim','lim x→0 ','Limit'],['Σ','Σ(k=1→n) ','Sum'],['√','√','Square root'],['π','π','Pi'],['x²','²','Squared'],['x³','³','Cubed'],['xⁿ','^','Power'],['∞','∞','Infinity'],['×','×','Times'],['÷','÷','Divide'],['→','→','Arrow'],['≠','≠','Not equal']];
  const TAGS = [
    {k:'main', label:'Main idea', prefix:'Main idea: ', re:/^\s*(?:main idea|key idea|big idea)\s*:\s*/i},
    {k:'def', label:'Definition', prefix:'Definition: ', re:/^\s*(?:definition|def)\s*:\s*/i},
    {k:'ex', label:'Example', prefix:'Example: ', re:/^\s*(?:example|ex|e\.g\.)\s*:\s*/i},
    {k:'formula', label:'Formula', prefix:'Formula: ', re:/^\s*(?:formula|equation)\s*:\s*/i},
    {k:'imp', label:'Important', prefix:'Important: ', re:/^\s*(?:(?:important|remember|warning|exam)\s*:|!!)\s*/i},
    {k:'q', label:'Question', prefix:'Question: ', re:/^\s*(?:question|q)\s*:\s*/i}
  ];
  const tagOf = line => /^\s*#{1,3}\s+\S/.test(line) ? 'head' : (TAGS.find(t => t.re.test(line)) || {}).k || null;
  const sid = () => Math.random().toString(36).slice(2, 10);

  function loadPrefs(){
    const d = {tool:'type', lastPen:'fountain', dock:'top', color:{fountain:'auto', ball:'#2747A8', pencil:'auto', marker:'#D2352B', highlighter:'#FFE14D'}, size:{fountain:1, ball:1, pencil:1, marker:1, highlighter:1, eraser:1}, stylusOnly:false};
    try { const p = JSON.parse(lsGet('notetime.ink') || 'null'); if (p) return {...d, ...p, color:{...d.color, ...(p.color || {})}, size:{...d.size, ...(p.size || {})}} } catch {}
    return d;
  }
  const prefs = loadPrefs();
  if (!['top','bottom','left','right'].includes(prefs.dock)) prefs.dock = 'top';
  const savePrefs = () => lsSet('notetime.ink', JSON.stringify(prefs));

  let M = null, act = null, sel = null, penSeen = false, ro = null, raf = 0;
  const bbCache = new WeakMap(), hinted = new Set();
  const V = {d:null, t:null, target:null, listening:false, speaking:false, speakSrc:null};
  const keyOf = (nb, page) => nb.id + '_' + page.id;
  const strokesOf = (nbId, pageId) => S.ink.get(nbId + '_' + pageId) || [];
  const isDrawing = () => prefs.tool !== 'type';
  const activePen = () => PENS.includes(prefs.tool) ? prefs.tool : (PENS.includes(prefs.lastPen) ? prefs.lastPen : 'fountain');

  /* ---------- rendering ---------- */
  const widthOf = s => s.t === 'highlighter' || s.t === 'marker' ? s.w : s.w * 1.5;
  function bbox(s){
    let b = bbCache.get(s); if (b) return b;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (let i = 0; i < s.p.length; i += 3){ const x = s.p[i] / 2, y = s.p[i+1] / 2; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
    const pad = widthOf(s) / 2 + 1; b = [x0 - pad, y0 - pad, x1 + pad, y1 + pad]; bbCache.set(s, b); return b;
  }
  function path(g, P, k, dx, dy){
    const n = P.length / 3, X = i => (P[i*3] / 2 + dx) * k, Y = i => (P[i*3+1] / 2 + dy) * k;
    g.beginPath(); g.moveTo(X(0), Y(0));
    if (n === 2) g.lineTo(X(1), Y(1));
    for (let i = 1; i < n - 1; i++) g.quadraticCurveTo(X(i), Y(i), (X(i) + X(i+1)) / 2, (Y(i) + Y(i+1)) / 2);
    if (n > 2) g.lineTo(X(n-1), Y(n-1));
  }
  function drawStroke(g, s, k, inkColor, o = {}){
    const P = s.p, n = P.length / 3; if (!n) return;
    const dx = o.dx || 0, dy = o.dy || 0;
    const col = o.color || (s.c === 'auto' ? inkColor : s.c);
    g.save(); g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round'; g.lineJoin = 'round';
    if (o.alpha) g.globalAlpha = o.alpha;
    const X = i => (P[i*3] / 2 + dx) * k, Y = i => (P[i*3+1] / 2 + dy) * k, PR = i => P[i*3+2] / 10;
    if (n === 1){
      const r = (s.t === 'highlighter' || s.t === 'marker' ? s.w / 2 : s.w * 0.6) * k;
      if (s.t === 'highlighter') g.globalAlpha *= 0.38;
      g.beginPath(); g.arc(X(0), Y(0), Math.max(r, 0.6), 0, Math.PI * 2); g.fill(); g.restore(); return;
    }
    if (s.t === 'highlighter'){ g.globalAlpha *= 0.38; g.lineCap = 'butt'; g.lineWidth = s.w * k; path(g, P, k, dx, dy); g.stroke() }
    else if (s.t === 'marker'){ g.globalAlpha *= 0.94; g.lineWidth = s.w * k; path(g, P, k, dx, dy); g.stroke() }
    else if (s.t === 'ball'){ g.lineWidth = s.w * k; path(g, P, k, dx, dy); g.stroke() }
    else if (s.t === 'pencil'){
      g.globalAlpha *= 0.8; g.lineWidth = s.w * 0.85 * k; path(g, P, k, dx, dy); g.stroke();
      g.globalAlpha = 0.18 * (o.alpha || 1); g.lineWidth = s.w * 1.7 * k; path(g, P, k, dx + 0.25, dy + 0.2); g.stroke();
    } else {
      for (let i = 1; i < n; i++){
        const sx = i === 1 ? X(0) : (X(i-1) + X(i)) / 2, sy = i === 1 ? Y(0) : (Y(i-1) + Y(i)) / 2;
        const ex = i === n - 1 ? X(i) : (X(i) + X(i+1)) / 2, ey = i === n - 1 ? Y(i) : (Y(i) + Y(i+1)) / 2;
        g.lineWidth = s.w * k * (0.35 + 1.15 * (PR(i-1) + PR(i)) / 2);
        g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(X(i), Y(i), ex, ey); g.stroke();
      }
    }
    g.restore();
  }
  function drawAll(g, strokes, k, inkColor, o = {}){
    const skip = o.skip;
    strokes.forEach(s => { if (s.t === 'highlighter' && !(skip && skip.has(s))) drawStroke(g, s, k, inkColor, o) });
    strokes.forEach(s => { if (s.t !== 'highlighter' && !(skip && skip.has(s))) drawStroke(g, s, k, inkColor, o) });
  }
  function luminance(c){
    const m = c.match(/#([0-9a-f]{6})/i); if (!m) return 1;
    const n = parseInt(m[1], 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  }

  /* ---------- toolbar ---------- */
  const btn = (id, label, extra = '') => `<button class="tool ${prefs.tool === id ? 'on' : ''}" data-tool="${id}" title="${label}" aria-label="${label}" aria-pressed="${prefs.tool === id}" ${extra}>${TI[id]}</button>`;
  function toolbarHtml(nb, readOnly){
    if (readOnly) return '';
    return `<div class="inkbar dock-${prefs.dock}" id="inkbar" role="toolbar" aria-label="Pens and writing tools">
      <button class="grip" id="tb-grip" title="Drag to move the toolbar to any side" aria-label="Move toolbar">${TI.grip}</button>
      <div class="tb-group tb-pens">${PENS.map(p => btn(p, LABEL[p])).join('')}</div>
      <div class="tb-sep"></div>
      <div class="tb-group tb-colors" id="tb-colors"></div>
      <div class="tb-sep"></div>
      <div class="tb-group tb-sizes" id="tb-sizes"></div>
      <div class="tb-sep"></div>
      <div class="tb-group">${btn('eraser', LABEL.eraser)}${btn('lasso', LABEL.lasso)}</div>
      <div class="tb-sep"></div>
      <div class="tb-group">${btn('type', LABEL.type)}${btn('voice', LABEL.voice)}<button class="tool" id="tb-math" title="Math symbols and color tags" aria-label="Math symbols and color tags" aria-haspopup="true">${TI.math}</button></div>
      <div class="tb-grow"></div>
      <div class="tb-group">
        <button class="tool" id="tb-undo" title="Undo ink" aria-label="Undo ink">${TI.undo}</button>
        <button class="tool" id="tb-redo" title="Redo ink" aria-label="Redo ink">${TI.redo}</button>
        <button class="tool" id="tb-convert" title="Convert handwriting to text" aria-label="Convert handwriting to text">${TI.convert}</button>
        ${V.t ? `<button class="tool" id="tb-read" title="Read this page aloud" aria-label="Read this page aloud">${V.speaking && V.speakSrc === 'page' ? TI.stop : TI.speaker}</button>` : ''}
        <button class="tool" id="tb-more" title="Toolbar position and more" aria-label="Toolbar position and more" aria-haspopup="true">${TI.more}</button>
      </div>
    </div>`;
  }
  function renderOpts(){
    const cEl = $('#tb-colors'), sEl = $('#tb-sizes'); if (!cEl || !sEl) return;
    const pen = activePen(), dim = !PENS.includes(prefs.tool);
    const colors = pen === 'highlighter' ? HL_COLORS : PEN_COLORS, cur = prefs.color[pen];
    cEl.classList.toggle('dim', dim);
    cEl.innerHTML = colors.map(c => `<button class="csw ${c === cur ? 'on' : ''}" data-col="${c}" style="--c:${c === 'auto' ? 'var(--ink)' : c}" title="${c === 'auto' ? 'Ink (matches the paper)' : c}" aria-label="${LABEL[pen]} color ${c === 'auto' ? 'ink' : c}"></button>`).join('') +
      `<label class="csw custom ${!colors.includes(cur) ? 'on' : ''}" title="Custom color" style="--c:${!colors.includes(cur) ? cur : 'transparent'}"><input type="color" id="tb-custom" value="${/^#/.test(cur) ? cur : '#2747a8'}" aria-label="Custom color"></label>`;
    $$('[data-col]', cEl).forEach(b => b.onclick = () => { prefs.color[pen] = b.dataset.col; savePrefs(); if (prefs.tool !== pen) setTool(pen); else renderOpts(); if (sel) recolorSel(prefs.color[pen]) });
    const ci = $('#tb-custom', cEl);
    ci.oninput = e => { prefs.color[pen] = e.target.value; savePrefs() };
    ci.onchange = () => { if (prefs.tool !== pen) setTool(pen); else renderOpts(); if (sel) recolorSel(prefs.color[pen]) };
    const sz = prefs.tool === 'eraser' ? 'eraser' : pen;
    sEl.classList.toggle('dim', dim && prefs.tool !== 'eraser');
    sEl.innerHTML = SIZES[sz].map((w, i) => `<button class="sz ${prefs.size[sz] === i ? 'on' : ''}" data-size="${i}" aria-label="${['Fine','Medium','Bold'][i]} ${LABEL[sz]}" title="${['Fine','Medium','Bold'][i]}"><i style="width:${4 + i * 5}px;height:${4 + i * 5}px"></i></button>`).join('');
    $$('[data-size]', sEl).forEach(b => b.onclick = () => { prefs.size[sz] = +b.dataset.size; savePrefs(); if (sz !== 'eraser' && prefs.tool !== sz) setTool(sz); else renderOpts() });
  }
  const HINTS = {lasso:'Draw a loop around ink to select it, then drag to move it.', voice: () => V.d ? 'Tap the page where the voice note should go, then speak.' : 'Tap the page to add a voice note. Speaking needs Chrome or the desktop app, so you can type it instead.', eraser:'The eraser removes whole strokes.'};
  function setTool(t){
    prefs.tool = t; if (PENS.includes(t)) prefs.lastPen = t; savePrefs();
    $$('#inkbar [data-tool]').forEach(b => { b.classList.toggle('on', b.dataset.tool === t); b.setAttribute('aria-pressed', String(b.dataset.tool === t)) });
    const paper = $('#paper'); if (paper) paper.classList.toggle('drawing', t !== 'type');
    if (t !== 'lasso') clearSel();
    renderOpts();
    if (HINTS[t] && !hinted.has(t)){ hinted.add(t); toast(typeof HINTS[t] === 'function' ? HINTS[t]() : HINTS[t]) }
    if (t === 'type') $('#ed-ta')?.focus({preventScroll:true});
  }
  function toggleTag(k){
    const ta = $('#ed-ta'); if (!ta) return;
    const v = ta.value, pos = ta.selectionStart;
    const start = v.lastIndexOf('\n', pos - 1) + 1; let end = v.indexOf('\n', pos); if (end < 0) end = v.length;
    const line = v.slice(start, end);
    const cur = TAGS.find(t => t.re.test(line)), want = TAGS.find(t => t.k === k);
    let out = cur ? line.replace(cur.re, '') : line.replace(/^\s+/, '');
    if (!cur || cur.k !== k) out = want.prefix + out;
    ta.focus(); ta.setSelectionRange(start, end); insertText(ta, out);
    const np = start + out.length; ta.setSelectionRange(np, np);
  }

  /* popovers that open toward the page from wherever the toolbar is docked */
  function closePop(){ $$('.tbpop').forEach(p => p.remove()) }
  function pop(anchor, html, wire){
    closePop();
    const p = document.createElement('div'); p.className = 'tbpop'; p.setAttribute('role', 'dialog'); p.innerHTML = html;
    document.body.appendChild(p);
    const r = anchor.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight, W = window.innerWidth, Hh = window.innerHeight;
    let x, y;
    if (prefs.dock === 'left'){ x = r.right + 8; y = r.top }
    else if (prefs.dock === 'right'){ x = r.left - w - 8; y = r.top }
    else if (prefs.dock === 'bottom'){ x = r.left + r.width / 2 - w / 2; y = r.top - h - 8 }
    else { x = r.left + r.width / 2 - w / 2; y = r.bottom + 8 }
    p.style.left = Math.max(8, Math.min(W - w - 8, x)) + 'px';
    p.style.top = Math.max(8, Math.min(Hh - h - 8, y)) + 'px';
    wire(p);
    return p;
  }
  document.addEventListener('pointerdown', e => { if (!e.target.closest('.tbpop') && !e.target.closest('#tb-math') && !e.target.closest('#tb-more')) closePop() });
  function openMath(anchor){
    pop(anchor, `<div class="tp-title">Insert math</div>
      <div class="sym-grid">${SYMBOLS.map(([l, ins, title], i) => `<button class="sym" data-sym="${i}" title="${title}">${l}</button>`).join('')}</div>
      <div class="tp-note">Or type words like “integral of x^2 from 0 to 3 =” and NoteTime writes the symbols.</div>
      <div class="tp-title">Color this line</div>
      <div class="tag-grid">${TAGS.map(tg => `<button class="tagbtn hl-${tg.k}" data-tag="${tg.k}">${tg.label}</button>`).join('')}</div>`, p => {
      $$('button', p).forEach(b => b.onmousedown = e => e.preventDefault());
      $$('[data-sym]', p).forEach(b => b.onclick = () => { if (prefs.tool !== 'type') setTool('type'); const ta = $('#ed-ta'); if (ta) insertText(ta, SYMBOLS[+b.dataset.sym][1]) });
      $$('[data-tag]', p).forEach(b => b.onclick = () => { if (prefs.tool !== 'type') setTool('type'); toggleTag(b.dataset.tag) });
    });
  }
  function openMore(anchor){
    pop(anchor, `<div class="tp-title">Toolbar position</div>
      <div class="dock-pick">${['top','left','right','bottom'].map(d => `<button class="${prefs.dock === d ? 'on' : ''}" data-dock="${d}">${d[0].toUpperCase() + d.slice(1)}</button>`).join('')}</div>
      <div class="tp-note">You can also drag the dotted handle to any edge of the screen.</div>
      <label class="chk"><input type="checkbox" id="tp-stylus" ${prefs.stylusOnly ? 'checked' : ''}> Only the stylus draws (fingers scroll)</label>
      <button class="tbtn danger" id="tp-clear">${TI.trash}Clear ink on this page</button>`, p => {
      $$('[data-dock]', p).forEach(b => b.onclick = () => { setDock(b.dataset.dock); closePop() });
      $('#tp-stylus', p).onchange = e => { prefs.stylusOnly = e.target.checked; savePrefs() };
      $('#tp-clear', p).onclick = () => { closePop(); if (!M || !M.strokes.length) return; const op = {rm:M.strokes.slice(), add:[]}; change(op); record(op); commit(); toast('Cleared the ink on this page. Undo brings it back.') };
    });
  }
  function setDock(d){
    prefs.dock = d; savePrefs();
    const bar = $('#inkbar'); if (!bar) return;
    bar.className = 'inkbar dock-' + d;
    applyDockPadding();
    setTimeout(() => { autosize(); refresh(); renderOverlay() }, 30);
  }
  function applyDockPadding(){
    const main = $('#nb-main'); if (!main) return;
    ['top','bottom','left','right'].forEach(d => main.classList.toggle('dock-pad-' + d, !!$('#inkbar') && prefs.dock === d));
  }
  function wireGrip(){
    const g = $('#tb-grip'), bar = $('#inkbar'); if (!g || !bar) return;
    let drag = null;
    g.onpointerdown = e => {
      e.preventDefault(); g.setPointerCapture(e.pointerId);
      const r = bar.getBoundingClientRect();
      drag = {id:e.pointerId, ox:e.clientX - r.left, oy:e.clientY - r.top, x0:e.clientX, y0:e.clientY, moved:false};
    };
    g.onpointermove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
      if (!drag.moved){ drag.moved = true; closePop(); bar.classList.add('dragging') }
      bar.style.left = (e.clientX - drag.ox) + 'px'; bar.style.top = (e.clientY - drag.oy) + 'px';
      const side = nearest(e.clientX, e.clientY); $$('.dock-hint').forEach(x => x.remove());
      const h = document.createElement('div'); h.className = 'dock-hint dh-' + side; document.body.appendChild(h);
    };
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const moved = drag.moved; drag = null;
      $$('.dock-hint').forEach(x => x.remove());
      bar.classList.remove('dragging'); bar.style.left = bar.style.top = '';
      if (moved) setDock(nearest(e.clientX, e.clientY)); else openMore(g);
    };
    g.onpointerup = end; g.onpointercancel = end;
  }
  function nearest(x, y){
    const W = window.innerWidth, Hh = window.innerHeight;
    const d = {left:x / W, right:(W - x) / W, top:y / Hh, bottom:(Hh - y) / Hh};
    return Object.entries(d).sort((a, b) => a[1] - b[1])[0][0];
  }

  /* ---------- mounting ---------- */
  function mount(nb, page, opts = {}){
    if (ro) ro.disconnect();
    closeVoice(); closePop();
    const ed = $('#ed'), paper = $('#paper');
    ed.insertAdjacentHTML('beforeend', `<canvas class="ink-base" id="ink-base"></canvas><canvas class="ink-live" id="ink-live"></canvas><div class="pins" id="pins"></div><div class="selbar" id="selbar" hidden></div>`);
    const key = keyOf(nb, page);
    if (!S.ink.has(key)) S.ink.set(key, []);
    S.ink.get(key).forEach(s => { if (!s.i) s.i = sid() });
    M = {nb, page, key, ed, paper, ta:$('#ed-ta'), base:$('#ink-base'), live:$('#ink-live'), pins:$('#pins'), strokes:S.ink.get(key), k:1, dpr:1, w:0, h:0, ro:!!opts.readOnly};
    sel = null; act = null;
    const cs = getComputedStyle(paper);
    M.inkColor = cs.getPropertyValue('--ink').trim() || '#1B2747';
    const light = luminance(cs.getPropertyValue('--paper').trim() || '#ffffff') > 0.5;
    M.base.classList.toggle('mult', light); M.live.classList.toggle('mult', light);
    paper.classList.toggle('drawing', !M.ro && prefs.tool !== 'type');
    paper.classList.toggle('viewing', M.ro);
    if (!M.ro){ wireToolbar(); renderOpts(); Hist.buttons() }
    applyDockPadding();
    const lv = M.live;
    lv.addEventListener('pointerdown', onDown);
    lv.addEventListener('pointermove', onMove);
    lv.addEventListener('pointerup', onUp);
    lv.addEventListener('pointercancel', onUp);
    ro = new ResizeObserver(() => { size(); redraw(); renderPins(); if (sel) drawSel() });
    ro.observe(ed);
    updateMinHeight();
  }
  function wireToolbar(){
    $$('#inkbar [data-tool]').forEach(b => b.onclick = () => setTool(b.dataset.tool));
    $('#tb-undo').onclick = () => Hist.undo(); $('#tb-redo').onclick = () => Hist.redo();
    $('#tb-convert').onclick = () => convert(false);
    $('#tb-math').onclick = e => { if ($('.tbpop')) closePop(); else openMath(e.currentTarget) };
    $('#tb-more').onclick = e => { if ($('.tbpop')) closePop(); else openMore(e.currentTarget) };
    const rd = $('#tb-read'); if (rd) rd.onclick = () => readAloud();
    wireGrip();
  }
  function size(){
    if (!M) return;
    const w = M.ed.clientWidth, h = M.ed.clientHeight; if (!w || !h) return;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w * h * dpr * dpr > 14e6) dpr = Math.max(0.75, Math.sqrt(14e6 / (w * h)));
    M.k = w / W0; M.dpr = dpr;
    for (const c of [M.base, M.live]){
      const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
      if (c.width !== cw || c.height !== ch){ c.width = cw; c.height = ch; c.style.width = w + 'px'; c.style.height = h + 'px' }
    }
    M.w = w; M.h = h;
  }
  function redraw(){
    if (!M) return; if (!M.w) size();
    const g = M.base.getContext('2d'); g.clearRect(0, 0, M.base.width, M.base.height);
    drawAll(g, M.strokes, M.k * M.dpr, M.inkColor, {skip: act && act.kind === 'move' && sel ? sel.set : null});
  }
  function liveCtx(){ const g = M.live.getContext('2d'); g.clearRect(0, 0, M.live.width, M.live.height); return g }
  function maxY(strokes){ let m = 0; strokes.forEach(s => { const b = bbox(s); if (b[3] > m) m = b[3] }); return m }
  function updateMinHeight(){
    if (!M) return;
    const lh = parseFloat(getComputedStyle(M.ta).lineHeight) || 34;
    const need = Math.max(lh * 26, (maxY(M.strokes) + 120) * M.k || 0, (M.page.h || 0) * (M.k || 1), ...(M.page.voice || []).map(v => (v.y + 120) * (M.k || 1)));
    M.ta.style.minHeight = Math.round(need) + 'px';
    autosize();
  }
  function refresh(){ if (M){ updateMinHeight(); size(); redraw(); renderPins(); if (sel) drawSel() } }
  function cancelActive(){ if (!M || !act) return; if (act.kind === 'draw' || act.kind === 'lasso'){ act = null; liveCtx() } else if (act.kind === 'erase'){ const a = act; act = null; liveCtx(); if (a.removed.length){ record({rm:a.removed, add:[]}); commit() } } else act = null }
  function remoteRefresh(key){
    if (!M || M.key !== key) return;
    M.strokes = S.ink.get(key) || [];
    if (sel){ const ids = new Set(M.strokes.map(s => s.i)); if ([...sel.set].some(s => !ids.has(s.i))) clearSel() }
    redraw(); updateMinHeight();
  }

  /* ---------- pointer handling ---------- */
  function local(e){ const r = M.live.getBoundingClientRect(); const kk = W0 / r.width; return [(e.clientX - r.left) * kk, (e.clientY - r.top) * kk, e.pointerType === 'mouse' ? 0.5 : (e.pressure || 0.5)] }
  const colorFor = t => prefs.color[t] || 'auto';
  const sizeFor = t => SIZES[t][prefs.size[t] ?? 1];
  function addPt(s, p){
    const P = s.p, n = P.length;
    const x = Math.round(p[0] * 2), y = Math.round(p[1] * 2), pr = Math.max(1, Math.min(10, Math.round(p[2] * 10)));
    if (n >= 3){ const ddx = x - P[n-3], ddy = y - P[n-2]; if (ddx * ddx + ddy * ddy < 2) return }
    P.push(x, y, pr);
  }
  function onDown(e){
    if (!M || M.ro || prefs.tool === 'type') return;
    if (e.pointerType === 'pen') penSeen = true;
    if (e.pointerType === 'touch' && (prefs.stylusOnly || penSeen)){
      if (act) return; act = {kind:'scroll', id:e.pointerId, y:e.clientY}; M.live.setPointerCapture(e.pointerId); return;
    }
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (act) return;
    e.preventDefault(); closeVoice(); closePop();
    M.live.setPointerCapture(e.pointerId);
    const p = local(e), t = prefs.tool;
    if (PENS.includes(t)){ act = {kind:'draw', id:e.pointerId, s:{i:sid(), t, c:colorFor(t), w:sizeFor(t), p:[]}}; addPt(act.s, p); drawLive() }
    else if (t === 'eraser'){ act = {kind:'erase', id:e.pointerId, removed:[]}; eraseAt(p); drawEraser(p) }
    else if (t === 'lasso'){
      if (sel && p[0] >= sel.box[0] && p[0] <= sel.box[2] && p[1] >= sel.box[1] && p[1] <= sel.box[3]){ act = {kind:'move', id:e.pointerId, start:p, dx:0, dy:0}; $('#selbar').hidden = true; redraw() }
      else { clearSel(); act = {kind:'lasso', id:e.pointerId, path:[p]} }
    } else if (t === 'voice') act = {kind:'tap', id:e.pointerId, p};
  }
  function onMove(e){
    if (!act || e.pointerId !== act.id) return;
    if (act.kind === 'scroll'){ window.scrollBy(0, act.y - e.clientY); act.y = e.clientY; return }
    let evs = e.getCoalescedEvents ? e.getCoalescedEvents() : []; if (!evs.length) evs = [e];
    if (act.kind === 'draw'){ evs.forEach(ev => addPt(act.s, local(ev))); drawLive() }
    else if (act.kind === 'erase'){ let p; evs.forEach(ev => { p = local(ev); eraseAt(p) }); drawEraser(p) }
    else if (act.kind === 'lasso'){ const p = local(e), last = act.path[act.path.length - 1]; if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 3) act.path.push(p); drawLasso() }
    else if (act.kind === 'move'){ const p = local(e); act.dx = p[0] - act.start[0]; act.dy = p[1] - act.start[1]; drawMove() }
  }
  function onUp(e){
    if (!act || e.pointerId !== act.id) return;
    const a = act; act = null;
    if (a.kind === 'draw'){
      liveCtx();
      a.s.p = simplify(a.s.p);
      const op = {rm:[], add:[a.s]}; change(op); record(op);
      const y = maxY([a.s]);
      if ((y + 160) * M.k > M.h){ M.page.h = Math.round(y + 520); Store.put(M.nb) }
      commit();
    } else if (a.kind === 'erase'){ liveCtx(); if (a.removed.length){ record({rm:a.removed, add:[]}); commit() } }
    else if (a.kind === 'lasso'){ liveCtx(); selectIn(a.path) }
    else if (a.kind === 'move'){
      if (Math.abs(a.dx) + Math.abs(a.dy) > 0.5){
        const ddx = Math.round(a.dx * 2), ddy = Math.round(a.dy * 2);
        const old = [...sel.set], moved = old.map(s => { const p = s.p.slice(); for (let i = 0; i < p.length; i += 3){ p[i] += ddx; p[i+1] += ddy } return {...s, i:sid(), p} });
        const op = {rm:old, add:moved}; change(op); record(op);
        sel = {set:new Set(moved), box:[sel.box[0] + a.dx, sel.box[1] + a.dy, sel.box[2] + a.dx, sel.box[3] + a.dy]};
        commit();
      } else redraw();
      drawSel();
    } else if (a.kind === 'tap') addVoice(a.p);
  }
  function scheduleLive(fn){ cancelAnimationFrame(raf); raf = requestAnimationFrame(fn) }
  function drawLive(){ scheduleLive(() => { if (!act || act.kind !== 'draw') return; drawStroke(liveCtx(), act.s, M.k * M.dpr, M.inkColor) }) }
  function drawEraser(p){
    if (!p) return; const g = liveCtx(), k = M.k * M.dpr, r = sizeFor('eraser');
    g.save(); g.strokeStyle = 'rgba(120,120,140,.8)'; g.fillStyle = 'rgba(120,120,140,.12)'; g.lineWidth = 1.2 * M.dpr;
    g.beginPath(); g.arc(p[0] * k, p[1] * k, r * k, 0, Math.PI * 2); g.fill(); g.stroke(); g.restore();
  }
  const accent = () => getComputedStyle(M.paper).getPropertyValue('--p-acc').trim() || '#2747A8';
  function drawLasso(){
    const g = liveCtx(), k = M.k * M.dpr; g.save(); g.setLineDash([6 * M.dpr, 5 * M.dpr]); g.strokeStyle = accent(); g.lineWidth = 1.5 * M.dpr;
    g.beginPath(); act.path.forEach((p, i) => i ? g.lineTo(p[0] * k, p[1] * k) : g.moveTo(p[0] * k, p[1] * k)); g.stroke(); g.restore();
  }
  function drawMove(){
    scheduleLive(() => { if (!act || act.kind !== 'move') return; const g = liveCtx(); drawAll(g, [...sel.set], M.k * M.dpr, M.inkColor, {dx:act.dx, dy:act.dy}); boxOutline(g, sel.box, act.dx, act.dy) });
  }
  function boxOutline(g, b, dx = 0, dy = 0){
    const k = M.k * M.dpr; g.save(); g.setLineDash([5 * M.dpr, 4 * M.dpr]); g.strokeStyle = accent(); g.lineWidth = 1.2 * M.dpr;
    g.strokeRect((b[0] + dx) * k, (b[1] + dy) * k, (b[2] - b[0]) * k, (b[3] - b[1]) * k); g.restore();
  }
  function simplify(P){
    const n = P.length / 3; if (n < 4) return P;
    const keep = new Uint8Array(n); keep[0] = keep[n-1] = 1;
    const eps = 0.7, stack = [[0, n - 1]];
    while (stack.length){
      const [a, b] = stack.pop(); let md = 0, mi = -1;
      const ax = P[a*3], ay = P[a*3+1], bx = P[b*3], by = P[b*3+1], L = Math.hypot(bx - ax, by - ay) || 1;
      for (let i = a + 1; i < b; i++){
        const d = Math.abs((by - ay) * P[i*3] - (bx - ax) * P[i*3+1] + bx * ay - by * ax) / L + Math.abs(P[i*3+2] - P[a*3+2]) * 0.15;
        if (d > md){ md = d; mi = i }
      }
      if (md > eps){ keep[mi] = 1; stack.push([a, mi], [mi, b]) }
    }
    const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push(P[i*3], P[i*3+1], P[i*3+2]);
    return out;
  }
  function segDist(px, py, ax, ay, bx, by){
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
  }
  function eraseAt(p){
    const r = sizeFor('eraser');
    const hits = M.strokes.filter(s => {
      const b = bbox(s); if (p[0] < b[0] - r || p[0] > b[2] + r || p[1] < b[1] - r || p[1] > b[3] + r) return false;
      const P = s.p, rr = r + widthOf(s) / 2;
      if (P.length === 3) return Math.hypot(P[0] / 2 - p[0], P[1] / 2 - p[1]) < rr;
      for (let i = 3; i < P.length; i += 3) if (segDist(p[0], p[1], P[i-3] / 2, P[i-2] / 2, P[i] / 2, P[i+1] / 2) < rr) return true;
      return false;
    });
    if (hits.length){ act.removed.push(...hits); change({rm:hits, add:[]}); redraw() }
  }
  function inPoly(x, y, poly){
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++){
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }
  function selectIn(poly){
    if (poly.length < 3){ clearSel(); return }
    const set = new Set();
    M.strokes.forEach(s => { let inside = 0, n = 0; for (let i = 0; i < s.p.length; i += 3){ n++; if (inPoly(s.p[i] / 2, s.p[i+1] / 2, poly)) inside++ } if (n && inside / n >= 0.5) set.add(s) });
    if (!set.size){ clearSel(); return }
    let b = [Infinity, Infinity, -Infinity, -Infinity];
    set.forEach(s => { const q = bbox(s); b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])] });
    sel = {set, box:[b[0] - 6, b[1] - 6, b[2] + 6, b[3] + 6]};
    drawSel();
  }
  function drawSel(){
    if (!sel || !M) return;
    const g = liveCtx(); g.save(); g.fillStyle = 'rgba(39,71,168,.06)'; const k = M.k * M.dpr;
    g.fillRect(sel.box[0] * k, sel.box[1] * k, (sel.box[2] - sel.box[0]) * k, (sel.box[3] - sel.box[1]) * k); g.restore();
    boxOutline(g, sel.box);
    const bar = $('#selbar');
    bar.innerHTML = `<span class="note">${sel.set.size} selected</span><button class="tbtn" data-sa="convert">${TI.convert}Convert to text</button>
      <span class="sel-colors">${PEN_COLORS.slice(0, 7).map(c => `<button class="csw sm" data-sc="${c}" style="--c:${c === 'auto' ? 'var(--ink)' : c}" aria-label="Recolor ${c}"></button>`).join('')}</span>
      <button class="tbtn danger" data-sa="delete">${TI.trash}Delete</button><button class="tbtn" data-sa="done" aria-label="Deselect">${TI.close}</button>`;
    bar.hidden = false;
    const top = sel.box[1] * M.k - 48;
    bar.style.top = (top < 0 ? sel.box[3] * M.k + 8 : top) + 'px';
    bar.style.left = Math.max(4, Math.min(M.w - bar.offsetWidth - 4, sel.box[0] * M.k)) + 'px';
    bar.onclick = e => {
      const c = e.target.closest('[data-sc]'); if (c){ recolorSel(c.dataset.sc); return }
      const a = e.target.closest('[data-sa]'); if (!a) return;
      if (a.dataset.sa === 'delete'){ const op = {rm:[...sel.set], add:[]}; change(op); record(op); clearSel(); commit() }
      else if (a.dataset.sa === 'convert') convert(true);
      else clearSel();
    };
  }
  function recolorSel(c){
    if (!sel) return;
    const old = [...sel.set].filter(s => s.t !== 'highlighter'); if (!old.length) return;
    const neu = old.map(s => ({...s, i:sid(), c}));
    const op = {rm:old, add:neu}; change(op); record(op);
    sel.set = new Set([...[...sel.set].filter(s => s.t === 'highlighter'), ...neu]); commit(); drawSel();
  }
  function clearSel(){ sel = null; if (M){ liveCtx(); const b = $('#selbar'); if (b) b.hidden = true } }

  /* ---------- history (operation based, so undo never touches other people's ink) ---------- */
  function setStrokes(arr){ M.strokes = arr; S.ink.set(M.key, arr) }
  function change(op){ const ids = new Set(op.rm.map(s => s.i)); setStrokes(M.strokes.filter(s => !ids.has(s.i)).concat(op.add)) }
  function record(op){ if (M) Hist.push(M.key, {k:'ink', op}) }
  function applyOp(op){ if (!M) return; change(op); clearSel(); commit() }
  function commit(){ redraw(); Store.putInk(M.key, M.strokes); updateMinHeight(); Hist.buttons(); if (M.nb.example){ M.nb.example = false; Store.put(M.nb) } }

  /* ---------- voice notes ---------- */
  function initVoice(d, t){
    V.d = d; V.t = t;
    if (d){
      d.onPartial(({text}) => { if (V.target && V.target.onPartial){ V.target.onPartial(text); return } const el = $('.vp-partial'); if (el) el.textContent = text });
      d.onFinal(({text}) => {
        if (V.target && V.target.onFinal){ V.target.onFinal(text); return }
        const n = V.target; if (!n || !text) return;
        n.text = (n.text ? n.text.replace(/\s+$/, '') + ' ' : '') + text.trim();
        const ta = $('.vp-text'); if (ta && ta.dataset.id === n.id) ta.value = n.text;
        const pe = $('.vp-partial'); if (pe) pe.textContent = '';
        if (M) Store.put(M.nb); renderPins();
      });
      d.onState(({state, reason}) => {
        V.listening = state !== 'idle';
        if (V.target && V.target.onState){ V.target.onState(state, reason); return }
        const b = $('.vp-rec'); if (b){ b.classList.toggle('rec', V.listening); b.innerHTML = V.listening ? `<i class="recdot"></i>Stop` : `${TI.voice}Record` }
        if (state === 'idle' && reason === 'not_granted') toast('Voice input is turned off for this page. You can type the note instead.');
        if (state === 'idle' && reason === 'unavailable') toast("Voice input isn't available right now. You can type the note instead.");
      });
    }
    if (t){
      t.onState(({state}) => {
        V.speaking = state === 'speaking' || state === 'starting' || state === 'paused';
        if (!V.speaking) V.speakSrc = null;
        const rd = $('#tb-read'); if (rd) rd.innerHTML = V.speaking && V.speakSrc === 'page' ? TI.stop : TI.speaker;
        const pb = $('.vp-play'); if (pb) pb.innerHTML = V.speaking && V.speakSrc === 'note' ? `${TI.stop}Stop` : `${TI.play}Play`;
        $$('[data-vplay]').forEach(b => b.innerHTML = V.speaking && V.speakSrc === 'ov:' + b.dataset.vplay ? `${TI.stop}Stop` : `${TI.play}Play`);
      });
    }
  }
  function speak(text, src){
    if (!V.t) return;
    if (V.speaking && V.speakSrc === src){ V.t.stop().catch(() => {}); return }
    const parts = text.replace(/\r/g, '').split(/\n{2,}/).map(x => x.trim()).filter(Boolean).flatMap(p => p.length > 1900 ? p.match(/[\s\S]{1,1900}(\s|$)/g) : [p]).slice(0, 40);
    if (!parts.length){ toast('There is nothing to read on this page yet.'); return }
    V.speakSrc = src;
    V.t.speak(parts.map(p => ({text:p.replace(/^#+\s*/gm, '')}))).catch(e => {
      if (e && e.code === 'not_granted') toast('Reading aloud is turned off for this page.');
      else if (e && e.code === 'busy') toast('Stop voice input first, then try reading aloud.');
      else if (e && e.code === 'rate_limited') toast('Too many read-aloud requests. Wait a moment.');
      else if (e && !['stopped','replaced','viewer_stopped'].includes(e.reason) && e.code !== 'stopped') toast("Couldn't read this aloud. Try again.");
    });
  }
  function readAloud(){ if (M) speak(M.page.text, 'page') }
  function renderPins(){
    if (!M) return;
    const list = M.page.voice || [];
    M.pins.innerHTML = list.map((v, i) => `<button class="pin ${v.text ? '' : 'empty'}" data-pin="${v.id}" style="left:${v.x * M.k}px;top:${v.y * M.k}px" title="${esc(v.text ? v.text.slice(0, 80) : 'Empty voice note')}" aria-label="Voice note ${i + 1}">${TI.speaker}<span>${i + 1}</span></button>`).join('');
    $$('[data-pin]', M.pins).forEach(b => b.onclick = e => { e.stopPropagation(); const n = list.find(x => x.id === b.dataset.pin); if (n) openVoice(n, false) });
  }
  function addVoice(p){
    M.page.voice = M.page.voice || [];
    const n = {id:uid(), x:Math.round(p[0]), y:Math.round(p[1]), text:'', at:Date.now()};
    M.page.voice.push(n); renderPins(); updateMinHeight();
    openVoice(n, true);
  }
  function closeVoice(){
    const p = $('.vpop'); if (!p) return;
    if (V.listening && V.d) V.d.stop().catch(() => {});
    const id = p.dataset.id; p.remove();
    if (M){ const n = (M.page.voice || []).find(x => x.id === id); if (n && !n.text.trim()){ M.page.voice = M.page.voice.filter(x => x !== n); renderPins() } else if (n) Store.put(M.nb) }
    V.target = null;
  }
  function openVoice(n, autoStart){
    closeVoice(); if (!M) return;
    const idx = M.page.voice.indexOf(n) + 1, rO = M.ro;
    const d = document.createElement('div'); d.className = 'vpop'; d.dataset.id = n.id; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Voice note ' + idx);
    d.innerHTML = `<div class="vp-head"><span class="pin-n">${idx}</span><b>Voice note</b><span class="note">${new Date(n.at).toLocaleString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}</span><button class="iconbtn sm vp-x" aria-label="Close voice note">${TI.close}</button></div>
      <textarea class="vp-text input" data-id="${n.id}" rows="4" ${rO ? 'readonly' : ''} placeholder="${V.d ? 'Press Record and speak, or type here' : 'Type your note here'}">${esc(n.text)}</textarea>
      <div class="vp-partial" aria-live="polite"></div>
      <div class="vp-acts">
        ${V.d && !rO ? `<button class="btn vp-rec">${TI.voice}Record</button>` : ''}
        ${V.t ? `<button class="btn vp-play">${TI.play}Play</button>` : ''}
        <span class="grow"></span>${rO ? '' : `<button class="btn ghost danger vp-del">${TI.trash}Delete</button>`}
      </div>
      ${V.d || rO ? '' : '<p class="note" style="margin:0">Speaking a note needs Chrome or the desktop app.</p>'}`;
    M.ed.appendChild(d);
    const W = M.w || M.ed.clientWidth;
    d.style.left = Math.max(6, Math.min(W - d.offsetWidth - 6, n.x * M.k - 24)) + 'px';
    d.style.top = (n.y * M.k + 26) + 'px';
    const ta = $('.vp-text', d);
    ta.oninput = () => { n.text = ta.value; Store.put(M.nb, 900); renderPins() };
    $('.vp-x', d).onclick = closeVoice;
    const del = $('.vp-del', d); if (del) del.onclick = () => { if (V.listening) V.d.stop().catch(() => {}); M.page.voice = M.page.voice.filter(x => x !== n); Store.put(M.nb); d.remove(); V.target = null; renderPins() };
    const play = $('.vp-play', d); if (play) play.onclick = () => speak(ta.value, 'note');
    const rec = $('.vp-rec', d);
    const start = () => { V.target = n; V.d.start().catch(e => { if (e && e.code === 'not_granted') toast('Voice input is turned off for this page. You can type the note instead.'); else if (e && e.code !== 'dismissed' && e.code !== 'no_gesture') toast("Couldn't start voice input. Try the Record button."); }) };
    if (rec) rec.onclick = () => { if (V.d.active()) V.d.stop().catch(() => {}); else start() };
    if (autoStart && V.d && !rO) start(); else if (!rO) ta.focus();
  }

  /* ---------- handwriting conversion ---------- */
  async function convert(onlySel){
    if (!M) return;
    if (!S.sample){ toast(window.NT_STANDALONE ? 'Converting handwriting uses Claude AI in the online version. Open it from notebook Settings → NoteTime AI.' : 'Converting handwriting needs NoteTime AI. Sign in to your account to use it.'); return }
    const list = (onlySel && sel ? [...sel.set] : M.strokes).filter(s => s.t !== 'highlighter');
    if (!list.length){ toast(onlySel ? 'Select some handwriting first.' : 'There is no handwriting on this page yet. Write with a pen first.'); return }
    const lim = await S.sample.limits().catch(() => null);
    if (!lim || !lim.images){ toast("Handwriting conversion isn't available in this view."); return }
    let b = [Infinity, Infinity, -Infinity, -Infinity];
    list.forEach(s => { const q = bbox(s); b = [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])] });
    const pad = 24, w = b[2] - b[0] + pad * 2, h = b[3] - b[1] + pad * 2;
    const sc = Math.min(2, 1600 / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.ceil(w * sc); c.height = Math.ceil(h * sc);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    list.forEach(s => drawStroke(g, s, sc, '#111111', {dx:pad - b[0], dy:pad - b[1], color: s.c === 'auto' || luminance(s.c) > 0.75 ? '#111111' : undefined}));
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const cb = $('#tb-convert'); if (cb) cb.classList.add('busy');
    toast('Reading your handwriting…');
    const prompt = `Transcribe the handwriting in this image into plain text for a notes app.
Rules:
- Keep the same line breaks. Don't add commentary, headings, quotes or code fences.
- Write math so the app can check it: × for times, ÷ or / for division, ^ or superscript digits (x²) for powers, √ for roots, π for pi.
- Integrals: ∫₀³ x² dx (subscript and superscript digits for whole-number bounds), ∫[a,b] f dx for other bounds, ∫ f dx for indefinite integrals.
- Derivatives: d/dx (expression). Limits: lim x→a (expression). Sums: Σ(k=1→n) expression.
- If a line ends with = and no answer, keep the = at the end.
- Copy mistakes exactly as written. Don't correct the math or spelling.
- Write [drawing] for sketches and [unclear] for words you can't read.
Reply with only the transcription.`;
    let text = '';
    try { text = (await S.sample(prompt, {images:[blob]})).text }
    catch (e){ if (cb) cb.classList.remove('busy'); toast(aiErr(e)); return }
    if (cb) cb.classList.remove('busy');
    text = text.replace(/^```[a-z]*\n?|\n?```$/gi, '').trim();
    if (!text){ toast("Couldn't read any handwriting there."); return }
    if (!M) return;
    const page = M.page;
    const lh = parseFloat(getComputedStyle(M.ta).lineHeight) || 34;
    const L = Math.max(0, Math.round((b[1] * M.k - lh) / lh));
    const lines = page.text.split('\n'); while (lines.length < L) lines.push('');
    const add = text.split('\n');
    const free = add.every((_, j) => !(lines[L + j] || '').trim());
    if (free) add.forEach((t, j) => { lines[L + j] = t }); else lines.splice(L, 0, ...add);
    const beforeText = page.text;
    page.text = lines.join('\n');
    const ids = new Set(list.map(s => s.i));
    const op = {rm:M.strokes.filter(s => ids.has(s.i)), add:[]}; change(op); clearSel();
    Hist.push(M.key, {k:'multi', list:[Hist.textEntry(beforeText, page.text), {k:'ink', op}]});
    Store.putInk(M.key, M.strokes); Store.put(M.nb, 50);
    toast(`Converted ${add.length} line${add.length === 1 ? '' : 's'} to text. Undo brings the handwriting back.`);
    renderNotes();
  }

  window.addEventListener('keydown', e => { if (e.key === 'Escape'){ closeVoice(); closePop(); if (sel) clearSel() } });
  document.addEventListener('pointerdown', e => { const p = $('.vpop'); if (p && !p.contains(e.target) && !e.target.closest('.pin') && !e.target.closest('#ink-live')) closeVoice() });

  return {toolbarHtml, mount, drawStroke, drawAll, strokesOf, maxY, prefs, savePrefs, isDrawing, initVoice, speak, V, TAGS, tagOf, W0, refresh, remoteRefresh, setDock, applyDockPadding, applyOp, cancelActive,
    unmount(){ if (ro) ro.disconnect(); ro = null; closeVoice(); closePop(); M = null }};
})();
