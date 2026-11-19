"use strict";
/* NoteTime import/export: PDF/PNG/Markdown/text/backup export, print-ready PDF, and notes from slides & documents. */
const IO = (() => {
  const LIBS = {
    jspdf:'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    jszip:'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    pdfjs:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    pdfworker:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  };
  const loading = {};
  function loadScript(url){
    return loading[url] || (loading[url] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = url; s.async = true;
      s.onload = () => res(); s.onerror = () => { delete loading[url]; rej(new Error('Could not load a helper library. Check your connection and try again.')) };
      document.head.appendChild(s);
    }));
  }
  async function pdfjs(){
    await loadScript(LIBS.pdfjs); await loadScript(LIBS.pdfworker);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIBS.pdfworker;
    return window.pdfjsLib;
  }
  const slug = s => (s || 'notebook').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'notebook';

  /* ---------- page rendering ---------- */
  function paperVars(nb){
    const el = document.createElement('div'); el.className = paperClasses(nb); el.style.cssText = 'position:absolute;left:-9999px;top:0;width:10px;height:10px';
    document.body.appendChild(el);
    const cs = getComputedStyle(el), g = n => cs.getPropertyValue(n).trim();
    const v = {paper:g('--paper') || '#fff', rule:g('--rule') || '#C6D3EC', ink:g('--ink') || '#1B2747', margin:g('--margin') || '#E9A2A2', acc:g('--p-acc') || '#2747A8'};
    el.remove(); return v;
  }
  const HLC = {main:'rgba(66,133,244,.24)', def:'rgba(52,168,83,.26)', ex:'rgba(251,188,4,.34)', formula:'rgba(142,68,173,.24)', imp:'rgba(234,67,53,.26)', q:'rgba(0,150,160,.24)'};
  function wrapText(g, line, maxW){
    if (!line) return [''];
    const out = []; let cur = '';
    for (const tok of line.split(/(\s+)/)){
      if (!tok) continue;
      if (g.measureText(cur + tok).width <= maxW || !cur){
        if (!cur && g.measureText(tok).width > maxW){
          let piece = '';
          for (const ch of tok){ if (g.measureText(piece + ch).width > maxW && piece){ out.push(piece); piece = '' } piece += ch }
          cur = piece;
        } else cur += tok;
      } else { out.push(cur.replace(/\s+$/, '')); cur = tok.replace(/^\s+/, '') }
    }
    out.push(cur); return out;
  }
  async function renderPage(nb, page, o){
    const s = nb.settings, W = 840, scale = o.scale || 2;
    const lh = {narrow:28, medium:34, wide:42}[s.spacing] || 34;
    const F = fontOf(s.font), fs = lh * F[3];
    const fam = `"${F[2]}"`;
    const font = `${fs}px ${fam}, ui-sans-serif, sans-serif`;
    try { await document.fonts.load(font) } catch {}
    const v = paperVars(nb);
    const padL = s.paper === 'college' ? 76 : 36, padR = 32, padT = lh;
    const meas = document.createElement('canvas').getContext('2d'); meas.font = font;
    const rows = [];
    page.text.split('\n').forEach(line => { const tag = s.colors !== false ? Ink.tagOf(line) : null; wrapText(meas, line, W - padL - padR).forEach((t, j) => rows.push({t, tag, first:j === 0})) });
    const strokes = o.ink ? (o.strokes || S.ink.get(nb.id + '_' + page.id) || []) : [];
    const voice = o.voice ? (page.voice || []).filter(x => x.text.trim()) : [];
    const textH = padT + rows.length * lh + lh * 2;
    const inkH = strokes.length ? Ink.maxY(strokes) + 60 : 0;
    const pinH = (page.voice || []).reduce((m, x) => Math.max(m, x.y + 60), 0);
    const bodyH = Math.max(o.minLines ? lh * 26 : lh * 6, textH, inkH, pinH);
    let appendix = [];
    if (voice.length){
      meas.font = '15px Inter, sans-serif';
      voice.forEach((x, i) => wrapText(meas, `${(page.voice || []).indexOf(x) + 1}. ${x.text.trim()}`, W - 80).forEach(t => appendix.push(t)));
    }
    const appH = appendix.length ? 70 + appendix.length * 22 : 0;
    const H = Math.ceil(bodyH + appH);
    const c = document.createElement('canvas'); c.width = W * scale; c.height = H * scale;
    const g = c.getContext('2d'); g.scale(scale, scale);
    g.fillStyle = o.whitePaper ? '#ffffff' : v.paper; g.fillRect(0, 0, W, H);
    const ink = o.whitePaper && /night/.test(s.color) ? '#1B2747' : v.ink;
    if (o.lines){
      g.fillStyle = o.whitePaper && s.color === 'night' ? '#C6D3EC' : v.rule;
      if (s.paper === 'lined' || s.paper === 'college') for (let y = lh - 5; y < bodyH; y += lh) g.fillRect(0, y, W, 1);
      if (s.paper === 'graph'){ for (let y = lh - 4; y < bodyH; y += lh) g.fillRect(0, y, W, 1); for (let x = 0; x < W; x += lh) g.fillRect(x, 0, 1, bodyH) }
      if (s.paper === 'dotted') for (let y = lh - 4; y < bodyH; y += lh) for (let x = 1; x < W; x += lh){ g.beginPath(); g.arc(x, y, 1.4, 0, 7); g.fill() }
      if (s.paper === 'college'){ g.fillStyle = v.margin; g.fillRect(60, 0, 1.5, bodyH) }
    }
    g.font = font; g.textBaseline = 'middle';
    rows.forEach((r, i) => {
      const y = padT + i * lh + lh / 2 + fs * 0.08;
      if (r.tag && r.tag !== 'head' && r.t){ g.fillStyle = HLC[r.tag]; g.fillRect(padL - 2, padT + i * lh + lh * 0.14, meas.measureText ? (g.measureText(r.t).width + 4) : 0, lh * 0.72) }
      if (r.tag === 'head'){ g.fillStyle = 'rgba(39,71,168,.10)'; g.fillRect(padL - 8, padT + i * lh + 3, W - padL - padR + 16, lh - 6) }
      g.fillStyle = ink; g.fillText(r.t, padL, y);
    });
    if (strokes.length){
      const light = !/night/.test(s.color) || o.whitePaper;
      const hl = strokes.filter(x => x.t === 'highlighter'), rest = strokes.filter(x => x.t !== 'highlighter');
      g.save(); if (light) g.globalCompositeOperation = 'multiply'; hl.forEach(x => Ink.drawStroke(g, x, 1, ink)); g.restore();
      rest.forEach(x => Ink.drawStroke(g, x, 1, ink));
    }
    (page.voice || []).forEach((x, i) => {
      if (!x.text.trim()) return;
      g.fillStyle = v.acc || '#2747A8'; g.beginPath(); g.arc(x.x, x.y, 11, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '600 12px Inter, sans-serif'; g.textAlign = 'center'; g.fillText(String(i + 1), x.x, x.y + 1); g.textAlign = 'left';
    });
    if (appendix.length){
      let y = bodyH + 24;
      g.fillStyle = o.whitePaper ? '#ffffff' : v.paper; g.fillRect(0, bodyH, W, appH);
      g.fillStyle = ink; g.globalAlpha = .25; g.fillRect(40, bodyH + 6, W - 80, 1); g.globalAlpha = 1;
      g.font = '600 16px Inter, sans-serif'; g.fillText('Voice notes', 40, y + 8); y += 36;
      g.font = '15px Inter, sans-serif'; appendix.forEach(t => { g.fillText(t, 40, y); y += 22 });
    }
    return c;
  }

  /* ---------- saving ---------- */
  async function save(filename, data){
    const dl = S.downloads || (window.claude && window.claude.use ? await window.claude.use('downloads').catch(() => null) : null);
    if (!dl) return 'unavailable';
    try { await dl.save({filename, data}); toast(`Saved ${filename}`); return 'ok' }
    catch (e){
      const c = e && e.code;
      if (c === 'declined'){ toast('Export canceled.'); return 'declined' }
      if (c === 'rejected_extension' || c === 'extension_not_enabled') return 'ext';
      if (c === 'too_large'){ toast('That file is too large to save. Try exporting fewer pages.'); return 'err' }
      if (c === 'not_granted' || c === 'unavailable' || c === 'capability_disabled') return 'unavailable';
      toast("Couldn't save the file. Try again."); return 'err';
    }
  }
  function showFallback(title, html, text){
    modal({title, wide:true, body:`<p class="muted" style="margin:0">Saving files isn't available in this view. ${text ? 'Copy the text below.' : 'Right-click or press and hold an image to save it.'}</p><div class="fallback">${html}</div>`,
      actions: text ? [{label:'Close'}, {label:'Copy', kind:'primary', run:() => { navigator.clipboard?.writeText(text).then(() => toast('Copied'), () => toast("Couldn't copy. Select the text instead.")); return false }}] : [{label:'Close', kind:'primary'}]});
  }

  function toMarkdown(nb, pages, o){
    const lines = [`# ${nb.name}`, '', `_Exported from NoteTime on ${new Date().toLocaleDateString()}_`, ''];
    pages.forEach(p => {
      const i = nb.pages.indexOf(p);
      lines.push(`## Page ${i + 1}`, '', p.text.replace(/^#\s+/gm, '### '), '');
      const vs = (p.voice || []).filter(v => v.text.trim());
      if (o.voice && vs.length){ lines.push('**Voice notes**', ''); vs.forEach((v, j) => lines.push(`> ${j + 1}. ${v.text.trim()}`)); lines.push('') }
      const ink = (S.ink.get(nb.id + '_' + p.id) || []).length;
      if (ink) lines.push(`_This page has handwriting (${ink} strokes). Export as PDF or image to include it._`, '');
    });
    return lines.join('\n');
  }
  function toText(nb, pages, o){
    return [nb.name, '='.repeat(Math.min(60, nb.name.length)), ''].concat(pages.flatMap(p => {
      const i = nb.pages.indexOf(p), vs = (p.voice || []).filter(v => v.text.trim());
      return [`--- Page ${i + 1} ---`, p.text, ...(o.voice && vs.length ? ['', 'Voice notes:', ...vs.map((v, j) => `  ${j + 1}. ${v.text.trim()}`)] : []), ''];
    })).join('\n');
  }
  function backup(nb){
    const ink = {}; nb.pages.forEach(p => { const s = S.ink.get(nb.id + '_' + p.id); if (s && s.length) ink[p.id] = s });
    const {chat, ...rest} = nb;
    return JSON.stringify({app:'NoteTime', kind:'notebook-backup', version:2, exportedAt:new Date().toISOString(), notebook:rest, ink});
  }
  async function makePdf(canvases, size, title){
    await loadScript(LIBS.jspdf);
    const {jsPDF} = window.jspdf;
    let pdf = null; let pageNo = 0;
    const add = (w, h) => { if (!pdf) pdf = new jsPDF({unit:'pt', format:[w, h], orientation: w > h ? 'l' : 'p', compress:true}); else pdf.addPage([w, h], w > h ? 'l' : 'p'); pageNo++ };
    const foot = (w, h) => { pdf.setFontSize(8); pdf.setTextColor(140); pdf.text(`${title} · ${pageNo}`, w / 2, h - 14, {align:'center'}) };
    for (const c of canvases){
      if (size === 'fit'){
        const w = 595.28, h = c.height / c.width * w; add(w, h);
        pdf.addImage(c.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, w, h);
      } else {
        const [pw, ph] = size === 'a4' ? [595.28, 841.89] : [612, 792];
        const m = 36, cw = pw - m * 2, sc = cw / c.width, slice = Math.floor((ph - m * 2 - 12) / sc);
        for (let y0 = 0; y0 < c.height; y0 += slice){
          const hpx = Math.min(slice, c.height - y0);
          const sl = document.createElement('canvas'); sl.width = c.width; sl.height = hpx;
          sl.getContext('2d').drawImage(c, 0, y0, c.width, hpx, 0, 0, c.width, hpx);
          add(pw, ph); pdf.addImage(sl.toDataURL('image/jpeg', 0.9), 'JPEG', m, m, cw, hpx * sc); foot(pw, ph);
        }
      }
    }
    return pdf.output('blob');
  }

  /* ---------- export dialog ---------- */
  function openExport(nb, mode){
    const print = mode === 'print';
    const st = {fmt: print ? 'pdf' : 'pdf', pages:'all', lines:true, ink:true, voice:true, size: print ? 'letter' : 'fit', white:print};
    const fmts = [['pdf','PDF','All pages with handwriting'],['png','Image','PNG of each page'],['md','Markdown','Typed text, for other apps'],['txt','Plain text','Typed text only'],['json','Backup','Everything, to restore later']];
    const body = `
      ${print ? `<div class="banner">${ic('print')}<div>This page can't open your browser's print dialog, so NoteTime makes a print-ready PDF sized to your paper. Open it and print from your PDF viewer.</div></div>` :
        `<div class="field"><span class="lbl">Format</span><div class="opts fmt" data-g="fmt">${fmts.map(([k, l, d]) => `<button type="button" class="opt ${st.fmt === k ? 'on' : ''}" data-v="${k}"><b>${l}</b><span>${d}</span></button>`).join('')}</div></div>`}
      <div class="ex-grid">
        <div class="ex-opts">
          <div class="field"><span class="lbl">Pages</span><div class="seg" data-g="pages"><button class="on" data-v="all">All ${nb.pages.length}</button><button data-v="cur">Page ${S.page + 1} only</button></div></div>
          <div class="field" data-show="pdf"><span class="lbl">Paper size</span><div class="seg" data-g="size">${[['fit','Fit page'],['letter','Letter'],['a4','A4']].map(([k, l]) => `<button class="${st.size === k ? 'on' : ''}" data-v="${k}">${l}</button>`).join('')}</div></div>
          <div class="field" data-show="pdf png md txt"><span class="lbl">Include</span>
            <label class="chk" data-show="pdf png"><input type="checkbox" data-k="lines" checked> Paper lines or grid</label>
            <label class="chk" data-show="pdf png"><input type="checkbox" data-k="ink" checked> Handwriting and highlights</label>
            <label class="chk" data-show="pdf png"><input type="checkbox" data-k="white" ${st.white ? 'checked' : ''}> White paper (saves printer ink)</label>
            <label class="chk"><input type="checkbox" data-k="voice" checked> Voice note transcripts</label>
          </div>
        </div>
        <div class="ex-prev" data-show="pdf png"><canvas id="ex-cv" aria-label="Preview of page ${S.page + 1}"></canvas><span class="note">Preview of page ${S.page + 1}</span></div>
      </div>`;
    const back = modal({title: print ? 'Print' : 'Export notebook', wide:true, body,
      actions:[{label:'Cancel'}, {label: print ? 'Make print PDF' : 'Export', kind:'primary', icon: print ? 'print' : 'download', run: async b => { await doExport(nb, st, b, print); return false }}],
      onMount: b => {
        const sync = () => {
          $$('[data-show]', b).forEach(x => { x.hidden = !x.dataset.show.split(' ').includes(st.fmt) });
          preview();
        };
        $$('[data-g]', b).forEach(g => g.onclick = e => { const btn = e.target.closest('[data-v]'); if (!btn) return; st[g.dataset.g] = btn.dataset.v; $$('[data-v]', g).forEach(x => x.classList.toggle('on', x === btn)); sync() });
        $$('[data-k]', b).forEach(i => i.onchange = () => { st[i.dataset.k] = i.checked; preview() });
        let t = 0;
        async function preview(){
          clearTimeout(t); t = setTimeout(async () => {
            const cv = $('#ex-cv', b); if (!cv || !['pdf','png'].includes(st.fmt)) return;
            const src = await renderPage(nb, nb.pages[S.page], {lines:st.lines, ink:st.ink, voice:st.voice, whitePaper:st.white, scale:0.5, minLines:true});
            const maxH = 360, w = 240, h = Math.min(maxH, src.height / src.width * w);
            cv.width = w * 2; cv.height = h * 2; cv.style.width = w + 'px'; cv.style.height = h + 'px';
            cv.getContext('2d').drawImage(src, 0, 0, src.width, Math.min(src.height, h / w * src.width), 0, 0, w * 2, h * 2);
          }, 80);
        }
        sync();
      }});
  }
  async function doExport(nb, st, back, print){
    const pages = st.pages === 'cur' ? [nb.pages[S.page]] : nb.pages;
    const btn = $('.btn.primary', back); const label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin"></span>Working…';
    const done = r => { btn.disabled = false; btn.innerHTML = label; if (r === 'ok') closeModal() };
    const base = slug(nb.name) + (st.pages === 'cur' ? `-page-${S.page + 1}` : '');
    try {
      if (st.fmt === 'md' || st.fmt === 'txt' || st.fmt === 'json'){
        const text = st.fmt === 'md' ? toMarkdown(nb, pages, st) : st.fmt === 'txt' ? toText(nb, pages, st) : backup(nb);
        const name = st.fmt === 'json' ? `${slug(nb.name)}.notetime.json` : `${base}.${st.fmt}`;
        const r = await save(name, text);
        if (r === 'unavailable' || r === 'ext'){ closeModal(); showFallback('Your export', `<textarea class="input" readonly rows="14">${esc(text)}</textarea>`, text); return }
        return done(r);
      }
      const opts = {lines:st.lines, ink:st.ink, voice:st.voice, whitePaper:st.white, minLines:true};
      const canvases = []; for (const p of pages) canvases.push(await renderPage(nb, p, opts));
      if (st.fmt === 'png'){
        let r = 'ok';
        for (let i = 0; i < canvases.length && r === 'ok'; i++){
          const blob = await new Promise(res => canvases[i].toBlob(res, 'image/png'));
          r = await save(`${slug(nb.name)}-page-${nb.pages.indexOf(pages[i]) + 1}.png`, blob);
        }
        if (r === 'unavailable'){ closeModal(); imageFallback(canvases); return }
        return done(r);
      }
      const blob = await makePdf(canvases, st.size, nb.name);
      const r = await save(`${base}${print ? '-print' : ''}.pdf`, blob);
      if (r === 'ok' && print) toast('Print PDF saved. Open it and print from your PDF viewer.');
      if (r === 'ext'){
        toast("PDF downloads aren't turned on here yet, so NoteTime saved images of each page instead.");
        let r2 = 'ok';
        for (let i = 0; i < canvases.length && r2 === 'ok'; i++){ const b = await new Promise(res => canvases[i].toBlob(res, 'image/png')); r2 = await save(`${slug(nb.name)}-page-${nb.pages.indexOf(pages[i]) + 1}.png`, b) }
        if (r2 === 'unavailable'){ closeModal(); imageFallback(canvases); return }
        return done(r2);
      }
      if (r === 'unavailable'){ closeModal(); imageFallback(canvases); return }
      done(r);
    } catch (e){ console.error(e); toast(e.message && /library/.test(e.message) ? e.message : "Couldn't make the export. Try again."); done('err') }
  }
  function imageFallback(canvases){ showFallback('Your pages', canvases.map(c => `<img src="${c.toDataURL('image/png')}" alt="Notebook page">`).join('')) }

  /* ---------- restore backup ---------- */
  function restoreBackup(folderId){
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!data || data.app !== 'NoteTime' || !data.notebook || !Array.isArray(data.notebook.pages)) throw new Error('bad');
        const nb = {...data.notebook, id:uid(), parentId:folderId || null, chat:[], example:false};
        const map = {}; nb.pages = nb.pages.map(p => { const id = uid(); map[p.id] = id; return {...p, id} });
        Object.entries(data.ink || {}).forEach(([pid, s]) => { if (map[pid] && Array.isArray(s)) Store.putInk(nb.id + '_' + map[pid], s, 50) });
        if (S.items.has(data.notebook.id) || notebooks().some(x => x.name === nb.name)) nb.name += ' (restored)';
        Store.put(nb, 50); toast(`Restored “${nb.name}”`); go('#nb-' + nb.id);
      } catch { toast("That file isn't a NoteTime backup. Choose a .notetime.json file exported from NoteTime.") }
    };
    inp.click();
  }

  /* ---------- import: extract ---------- */
  const A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main', P_NS = 'http://schemas.openxmlformats.org/presentationml/2006/main', W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main', R_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const xml = s => new DOMParser().parseFromString(s, 'application/xml');
  const num = p => +(p.match(/(\d+)\.xml$/) || [0, 0])[1];
  async function extractPptx(file, step){
    await loadScript(LIBS.jszip);
    const zip = await window.JSZip.loadAsync(file);
    const slides = Object.keys(zip.files).filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p)).sort((a, b) => num(a) - num(b));
    const units = [];
    for (const [i, p] of slides.entries()){
      step(`Reading slide ${i + 1} of ${slides.length}`);
      const d = xml(await zip.file(p).async('string'));
      let title = '';
      const body = [];
      [...d.getElementsByTagNameNS(P_NS, 'sp')].forEach(sp => {
        const ph = sp.getElementsByTagNameNS(P_NS, 'ph')[0];
        const isTitle = ph && /title/i.test(ph.getAttribute('type') || '');
        const paras = [...sp.getElementsByTagNameNS(A_NS, 'p')].map(pp => [...pp.getElementsByTagNameNS(A_NS, 't')].map(t => t.textContent).join('').trim()).filter(Boolean);
        if (isTitle && !title) title = paras.join(' '); else body.push(...paras);
      });
      [...d.getElementsByTagNameNS(A_NS, 'tbl')].forEach(tb => [...tb.getElementsByTagNameNS(A_NS, 'tr')].forEach(tr => body.push([...tr.getElementsByTagNameNS(A_NS, 'tc')].map(tc => tc.textContent.trim()).join(' | '))));
      let notes = '';
      const rel = zip.file(p.replace('slides/', 'slides/_rels/') + '.rels');
      if (rel){
        const r = [...xml(await rel.async('string')).getElementsByTagNameNS(R_NS, 'Relationship')].find(x => /notesSlide$/.test(x.getAttribute('Type') || ''));
        if (r){ const np = 'ppt/' + r.getAttribute('Target').replace(/^\.\.\//, ''); const nf = zip.file(np); if (nf){ const nd = xml(await nf.async('string')); notes = [...nd.getElementsByTagNameNS(A_NS, 'p')].map(pp => [...pp.getElementsByTagNameNS(A_NS, 't')].map(t => t.textContent).join('').trim()).filter(t => t && !/^\d+$/.test(t)).join(' ') } }
      }
      units.push({label:`Slide ${i + 1}`, title, text:body.join('\n'), notes});
    }
    return {kind:'slideshow', unit:'slides', units, images:[]};
  }
  async function extractDocx(file, step){
    await loadScript(LIBS.jszip);
    step('Reading the document');
    const zip = await window.JSZip.loadAsync(file);
    const f = zip.file('word/document.xml'); if (!f) throw new Error("This Word file doesn't have any text in it.");
    const d = xml(await f.async('string'));
    const units = []; let cur = {label:'Start', title:'', text:''};
    [...d.getElementsByTagNameNS(W_NS, 'p')].forEach(p => {
      const t = [...p.getElementsByTagNameNS(W_NS, 't')].map(x => x.textContent).join('').trim(); if (!t) return;
      const st = p.getElementsByTagNameNS(W_NS, 'pStyle')[0]; const style = st ? (st.getAttributeNS(W_NS, 'val') || st.getAttribute('w:val') || '') : '';
      if (/heading|title/i.test(style)){ if (cur.text || cur.title) units.push(cur); cur = {label:`Section ${units.length + 1}`, title:t, text:''} }
      else cur.text += (p.getElementsByTagNameNS(W_NS, 'numPr').length ? '- ' : '') + t + '\n';
    });
    if (cur.text || cur.title) units.push(cur);
    return {kind:'document', unit:'sections', units, images:[]};
  }
  async function extractPdf(file, step, maxImages){
    step('Opening the PDF');
    const lib = await pdfjs();
    const doc = await lib.getDocument({data: new Uint8Array(await file.arrayBuffer()), isEvalSupported:false}).promise;
    const n = Math.min(doc.numPages, 120), units = []; let chars = 0;
    for (let i = 1; i <= n; i++){
      step(`Reading page ${i} of ${n}`);
      const pg = await doc.getPage(i);
      const tc = await pg.getTextContent();
      let text = ''; tc.items.forEach(it => { text += it.str + (it.hasEOL ? '\n' : ' ') });
      text = text.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
      chars += text.length;
      units.push({label:`Page ${i}`, title:'', text});
    }
    const images = [];
    if (chars < 80 * n && maxImages){
      for (let i = 1; i <= Math.min(n, maxImages); i++){
        step(`Looking at page ${i} as an image`);
        const pg = await doc.getPage(i); const vp = pg.getViewport({scale:1.4});
        const c = document.createElement('canvas'); c.width = vp.width; c.height = vp.height;
        await pg.render({canvasContext:c.getContext('2d'), viewport:vp}).promise;
        images.push(await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85)));
      }
    }
    return {kind: doc.numPages > 1 && units.every(u => u.text.length < 900) ? 'slideshow' : 'document', unit:'pages', units, images};
  }
  async function extract(file, step, maxImages){
    const name = file.name.toLowerCase();
    if (/\.pptx$/.test(name)) return extractPptx(file, step);
    if (/\.docx$/.test(name)) return extractDocx(file, step);
    if (/\.pdf$/.test(name) || file.type === 'application/pdf') return extractPdf(file, step, maxImages);
    if (/\.(txt|md|markdown|csv)$/.test(name) || /^text\//.test(file.type)){
      step('Reading the file'); const t = await file.text();
      const parts = t.split(/\n(?=#{1,3}\s)/);
      return {kind:'document', unit:'sections', units: parts.map((p, i) => ({label:`Section ${i + 1}`, title:'', text:p.trim()})), images:[]};
    }
    if (/^image\//.test(file.type)) return {kind:'images', unit:'images', units:[], images:[file]};
    if (/\.(ppt|doc|key|pages)$/.test(name)) throw new Error('That is an older or Apple format. Save it as .pptx, .docx or PDF first, then upload it again.');
    throw new Error('NoteTime can read PowerPoint (.pptx), PDF, Word (.docx), text files and images.');
  }

  /* ---------- import: notes ---------- */
  const PREFIX = {main:'Main idea: ', def:'Definition: ', example:'Example: ', formula:'Formula: ', important:'Important: ', question:'Question: ', point:'- '};
  function unitText(u){ return `[${u.label}]${u.title ? ' ' + u.title : ''}\n${u.text}${u.notes ? '\nSpeaker notes: ' + u.notes : ''}` }
  function chunks(units, max){
    const out = []; let cur = [], len = 0;
    units.forEach(u => { const t = unitText(u).slice(0, max); if (len + t.length > max && cur.length){ out.push(cur); cur = []; len = 0 } cur.push(t); len += t.length + 2 });
    if (cur.length) out.push(cur);
    return out;
  }
  async function aiNotes(src, fileName, detail, step, signal){
    const lim = await S.sample.limits().catch(() => null);
    const canImg = lim && lim.images;
    const parts = src.units.length ? chunks(src.units, 36000) : [[]];
    let title = '', summary = ''; const sections = [];
    for (const [i, part] of parts.entries()){
      step(parts.length > 1 ? `Writing notes, part ${i + 1} of ${parts.length}` : 'Writing color-coded notes');
      const imgs = i === 0 && canImg ? src.images.slice(0, canImg.maxCount || 5) : [];
      const what = src.kind === 'slideshow' ? 'slideshow' : src.kind === 'images' ? 'photos' : src.kind === 'video' ? 'video' : 'document';
      const prompt = `You are making study notes for a student from their ${what} "${fileName}"${parts.length > 1 ? ` (part ${i + 1} of ${parts.length})` : ''}. Turn it into clear, easy-to-follow, color-coded notes.${src.kind === 'video' ? ` The SOURCE is the video's transcript, labeled by timestamp${imgs.length ? `, and the attached images are frames from the video taken at ${src.frameTimes.slice(0, imgs.length).join(', ')} (use them for slides, diagrams and anything written on screen)` : ''}. Put the time range in each section's "from", like "03:00–06:00".` : ''}
Reply with only JSON:
{"title":"short title for the notes","summary":"2-3 sentence overview","sections":[{"heading":"topic name","from":"e.g. Slides 3-5","lines":[{"tag":"main","text":"..."}]}]}
Each line gets exactly one tag:
- "main": a main idea, in plain words
- "def": a definition, written as "Term — meaning"
- "example": an example or real-world application
- "formula": a formula or equation in plain text (^ for powers, × for times, √ for roots, ∫ for integrals)
- "important": likely on a test, a warning, or a common mistake
- "question": a question that checks understanding
- "point": a supporting detail
Rules: follow the source's order. ${detail === 'brief' ? 'Keep it short: 3-6 sections with 3-6 lines each.' : 'One section per topic with 4-12 lines each.'} Lines under 25 words. Use the speaker notes when they add something. Don't invent facts beyond brief clarifications. Skip slide numbers, footers and "thank you" slides.
${imgs.length && !part.length ? 'The source is in the attached images.' : ''}
SOURCE:
${part.join('\n\n') || '(see images)'}`;
      const r = await S.sample.json(prompt, {signal, ...(imgs.length ? {images:imgs} : {})});
      if (!r || !Array.isArray(r.sections)) throw {code:'invalid_json'};
      if (!title && r.title) title = String(r.title);
      if (r.summary) summary += (summary ? ' ' : '') + String(r.summary);
      r.sections.forEach(s => sections.push(s));
    }
    return {title, summary, sections};
  }
  function plainNotes(src){
    return {title:'', summary:'', sections: src.units.filter(u => u.text || u.title).map(u => ({heading:`${u.label}${u.title ? ': ' + u.title : ''}`, from:'', lines: u.text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean).map(l => {
      const m = l.match(/^([A-Za-z][\w ()'’-]{1,40}?)\s*[:—–]\s+(.{6,})$/);
      return m ? {tag:'def', text:`${m[1]} — ${m[2]}`} : {tag:'point', text:l};
    }).concat(u.notes ? [{tag:'point', text:'Speaker notes: ' + u.notes}] : [])}))};
  }
  function notesToPages(n, fileName){
    const pages = []; let cur = [];
    const head = [`# ${n.title || fileName.replace(/\.\w+$/, '')}`];
    if (n.summary) head.push(`Main idea: ${n.summary}`);
    head.push('');
    cur.push(...head);
    n.sections.forEach(s => {
      const block = [`# ${String(s.heading || 'Notes').trim()}`];
      if (s.from) block.push(`(${String(s.from).trim()})`);
      (s.lines || []).forEach(l => { if (!l || !l.text) return; block.push((PREFIX[l.tag] || '- ') + String(l.text).replace(/\s+/g, ' ').trim()) });
      block.push('');
      if (cur.length + block.length > 34 && cur.length > head.length){ pages.push(cur.join('\n').trim()); cur = [] }
      cur.push(...block);
    });
    if (cur.length) pages.push(cur.join('\n').trim());
    return pages.map(text => ({id:uid(), text, voice:[]}));
  }

  /* ---------- video ---------- */
  const isVideo = f => /^video\//.test(f.type) || /\.(mp4|m4v|mov|webm|ogv)$/i.test(f.name);
  const isCaps = f => /\.(vtt|srt)$/i.test(f.name);
  function parseCaptions(text){
    const out = [];
    text.replace(/\r/g, '').split(/\n\s*\n/).forEach(b => {
      const lines = b.split('\n'); const ti = lines.findIndex(l => /-->/.test(l)); if (ti < 0) return;
      const m = lines[ti].match(/(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d+)/); if (!m) return;
      const t = (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]);
      const txt = lines.slice(ti + 1).join(' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (txt && (!out.length || out[out.length - 1].text !== txt)) out.push({t, text:txt});
    });
    return out;
  }
  function seek(v, t){ return new Promise(res => { const done = () => { v.removeEventListener('seeked', done); clearTimeout(to); res() }; const to = setTimeout(done, 4000); v.addEventListener('seeked', done); v.currentTime = t }) }
  async function grabFrames(v, n, step){
    const out = [], dur = v.duration || 0; if (!dur || !n) return out;
    v.pause();
    const w = Math.min(1024, v.videoWidth || 1024), h = Math.round(w * (v.videoHeight || 576) / (v.videoWidth || 1024));
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    for (let i = 1; i <= n; i++){
      const t = Math.min(dur - 0.5, dur * i / (n + 1)); step(`Looking at the video, frame ${i} of ${n}`);
      await seek(v, t);
      try { g.drawImage(v, 0, 0, w, h); const b = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.8)); if (b) out.push({t:Math.round(t), blob:b}) } catch {}
    }
    return out;
  }
  function transcriptUnits(tr){
    const units = []; let cur = null;
    tr.forEach(l => { if (!cur || l.t - cur.t0 >= 180){ cur = {t0:l.t, lines:[]}; units.push(cur) } cur.lines.push(l.text) });
    return units.map(u => ({label:fmtTime(u.t0), title:'', text:u.lines.join(' ')}));
  }

  function openImport(folderId, intoNb){
    let file = null, caps = null, ctl = null, vurl = null, tr = [], listening = false;
    const canListen = !!(Ink.V && Ink.V.d);
    const body = `
      <p class="muted" style="margin:0">${intoNb ? `New pages will be added to the end of “${esc(intoNb.name)}”.` : 'NoteTime reads your file or video and writes study notes as a new notebook.'} Lines are color-coded:</p>
      <div class="legend">${Ink.TAGS.map(t => `<i class="hl-${t.k}">${t.label}</i>`).join('')}</div>
      <label class="drop" id="im-drop" tabindex="0">
        <input type="file" id="im-file" accept=".pptx,.pdf,.docx,.txt,.md,image/png,image/jpeg,image/webp,video/*,.mp4,.m4v,.mov,.webm" hidden>
        ${ic('upload')}<b id="im-name">Choose a file or video, or drop it here</b><span class="note">Slides (.pptx), PDF, Word (.docx), text, photos, or a video (.mp4, .webm, .mov)</span>
      </label>
      <div id="im-video" hidden>
        <video id="im-vid" class="mc-video" controls playsinline preload="metadata"></video>
        <div class="field"><span class="lbl">What the video says</span>
          <div class="opts fmt" id="im-tsrc">
            ${canListen ? `<button type="button" class="opt on" data-v="listen"><b>Listen and transcribe</b><span>Plays the video and writes down the speech. Turn your sound up.</span></button>` : ''}
            <button type="button" class="opt ${canListen ? '' : 'on'}" data-v="captions"><b>Captions file</b><span>Use the video's .vtt or .srt subtitles</span></button>
            <button type="button" class="opt" data-v="none"><b>Skip</b><span>Notes from what's on screen only</span></button>
          </div>
          ${canListen ? '' : `<span class="note">Listening to the video needs Chrome or the desktop app.</span>`}
        </div>
        <div id="im-listen" ${canListen ? '' : 'hidden'}>
          <div class="listen-row"><div class="seg" id="im-speed"><button data-v="1" class="on">1×</button><button data-v="1.25">1.25×</button><button data-v="1.5">1.5×</button></div>
            <button type="button" class="btn primary" id="im-lgo">${ic('play')}Start listening</button><span class="note" id="im-lstat"></span></div>
          <div class="mc-tr live" id="im-live" aria-live="polite"><span class="note">The transcript appears here as the video plays. You can stop any time and make notes from what's been heard.</span></div>
        </div>
        <div id="im-caps" ${canListen ? 'hidden' : ''}><label class="btn" style="align-self:flex-start">${ic('upload')}<span id="im-capname">Choose a .vtt or .srt file</span><input type="file" id="im-capfile" accept=".vtt,.srt,text/vtt" hidden></label></div>
      </div>
      <div class="field" id="im-detail-f"><span class="lbl">Detail</span><div class="seg" id="im-detail"><button class="on" data-v="full">Detailed study notes</button><button data-v="brief">Quick summary</button></div></div>
      ${intoNb ? '' : `<div class="field"><label for="im-folder">Save in</label><select class="input" id="im-folder">${folderOptions(folderId)}</select></div>`}
      ${S.sample ? '' : `<div class="banner">${ic('spark')}<div>Without NoteTime AI, NoteTime copies the text or transcript into tidy pages but can't summarize, color-code by meaning, or read photos and video frames. ${window.NT_STANDALONE ? ' Full study notes use Claude AI in the online version:' : ' Sign in to your account for full study notes.'}${window.NT_STANDALONE ? '<div style="margin-top:8px">' + onlineBtn() + '</div>' : ''}</div></div>`}
      <div class="steps" id="im-steps" hidden></div>`;
    const stopListening = () => { const v = $('#im-vid'); if (v) v.pause(); if (listening && Ink.V.d){ Ink.V.d.stop().catch(() => {}) } listening = false; if (Ink.V.target && Ink.V.target.video) Ink.V.target = null };
    const back = modal({title: intoNb ? 'Add notes from a file or video' : 'Make notes from a file or video', body, wide:true,
      onClose: () => { stopListening(); ctl && ctl.abort(); if (vurl) URL.revokeObjectURL(vurl) },
      actions:[{label:'Cancel', run:() => { stopListening(); ctl && ctl.abort() }}, {label:'Make notes', kind:'primary', icon:'spark', run: async b => { await run(b); return false }}],
      onMount: b => {
        const inp = $('#im-file', b), drop = $('#im-drop', b), vid = $('#im-vid', b);
        const pick = f => {
          if (!f) return;
          if (isCaps(f) && file && isVideo(file)){ setCaps(f); return }
          file = f; $('#im-name', b).textContent = f.name; drop.classList.add('has');
          const vidMode = isVideo(f);
          $('#im-video', b).hidden = !vidMode;
          if (vidMode){ if (vurl) URL.revokeObjectURL(vurl); vurl = URL.createObjectURL(f); vid.src = vurl; tr = []; vid.onerror = () => toast("This browser can't play that video. Try an .mp4 (H.264) or .webm file.") }
        };
        const setCaps = f => { caps = f; $('#im-capname', b).textContent = f.name; f.text().then(t => { tr = parseCaptions(t); renderLive(); if (!tr.length) toast("That captions file didn't have any lines NoteTime could read.") }) };
        inp.onchange = () => pick(inp.files[0]);
        $('#im-capfile', b).onchange = e => e.target.files[0] && setCaps(e.target.files[0]);
        drop.onkeydown = e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); inp.click() } };
        drop.ondragover = e => { e.preventDefault(); drop.classList.add('over') };
        drop.ondragleave = () => drop.classList.remove('over');
        drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); [...e.dataTransfer.files].sort((x, y) => isCaps(x) - isCaps(y)).forEach(pick) };
        $('#im-detail', b).onclick = e => { const x = e.target.closest('[data-v]'); if (!x) return; $$('#im-detail button', b).forEach(y => y.classList.toggle('on', y === x)) };
        $('#im-speed', b).onclick = e => { const x = e.target.closest('[data-v]'); if (!x) return; $$('#im-speed button', b).forEach(y => y.classList.toggle('on', y === x)); vid.playbackRate = +x.dataset.v };
        $('#im-tsrc', b).onclick = e => { const x = e.target.closest('[data-v]'); if (!x) return; $$('#im-tsrc .opt', b).forEach(y => y.classList.toggle('on', y === x)); $('#im-listen', b).hidden = x.dataset.v !== 'listen'; $('#im-caps', b).hidden = x.dataset.v !== 'captions'; if (x.dataset.v !== 'listen') stopListening() };
        const go = $('#im-lgo', b);
        if (go) go.onclick = () => {
          if (listening){ stopListening(); go.innerHTML = `${ic('play')}Continue listening`; $('#im-lstat', b).textContent = `Stopped at ${fmtTime(vid.currentTime)}`; return }
          if (!file || !isVideo(file)){ toast('Choose a video first.'); return }
          let partial = '';
          Ink.V.target = {video:true,
            onPartial: t => { partial = t; renderLive(partial) },
            onFinal: t => { partial = ''; if (t && t.trim()) tr.push({t:Math.max(0, Math.round(vid.currentTime - 3)), text:t.trim()}); renderLive() },
            onState: (state, reason) => {
              if (state === 'idle' && listening){
                listening = false; vid.pause(); go.innerHTML = `${ic('play')}Continue listening`;
                $('#im-lstat', b).textContent = reason === 'not_granted' ? 'Voice input is turned off for this page.' : reason === 'time_limit' ? 'Voice input paused after its time limit. Press Continue.' : reason === 'hidden' ? 'Paused because the page was hidden. Press Continue.' : vid.ended ? 'Finished.' : 'Paused. Press Continue.';
              }
            }};
          vid.playbackRate = +($('#im-speed .on', b).dataset.v);
          Ink.V.d.start().then(() => { listening = true; vid.play().catch(() => {}); go.innerHTML = `${ic('stop')}Stop`; $('#im-lstat', b).textContent = 'Listening…' })
            .catch(e => { $('#im-lstat', b).textContent = e && e.code === 'not_granted' ? 'Voice input is turned off for this page.' : "Couldn't start listening. Try again." });
        };
        vid.onended = () => { if (listening){ Ink.V.d.stop().catch(() => {}) } };
      }});
    function renderLive(partial){
      const el = $('#im-live', back); if (!el) return;
      el.innerHTML = tr.map(l => `<div class="tl"><span class="ts">${fmtTime(l.t)}</span><span class="tx">${esc(l.text)}</span></div>`).join('') + (partial ? `<div class="tl partial"><span class="ts">…</span><span class="tx">${esc(partial)}</span></div>` : '') || '<span class="note">Nothing heard yet.</span>';
      el.scrollTop = el.scrollHeight;
    }
    async function run(b){
      if (!file){ toast('Choose a file or video first.'); return }
      const video = isVideo(file);
      if (!video && file.size > 60 * 1024 * 1024){ toast('That file is over 60 MB. Try a smaller one.'); return }
      stopListening();
      const btn = $('.btn.primary:not(#im-lgo)', b); btn.disabled = true;
      const steps = $('#im-steps', b); steps.hidden = false;
      const step = t => { steps.innerHTML = `<div class="thinking"><span class="spin"></span>${esc(t)}</div>` };
      ctl = new AbortController();
      try {
        const lim = S.sample ? await S.sample.limits().catch(() => null) : null;
        const detail = $('#im-detail .on', b).dataset.v;
        let src, media = null;
        if (video){
          const vid = $('#im-vid', b);
          if (!vid.duration || !isFinite(vid.duration)) await new Promise(r => { vid.onloadedmetadata = r; setTimeout(r, 4000) });
          if (!vid.duration) throw new Error("NoteTime couldn't read that video. Try an .mp4 (H.264) or .webm file.");
          const nFrames = lim && lim.images ? Math.min(lim.images.maxCount || 5, 12, Math.max(3, Math.ceil(vid.duration / 90))) : 0;
          const frames = await grabFrames(vid, nFrames, step);
          if (!tr.length && !frames.length) throw new Error(S.sample ? "There's no transcript yet. Listen to the video or add a captions file first." : 'Without NoteTime AI, NoteTime needs a transcript. Listen to the video or add a captions file first.');
          let url = null;
          if (S.assets && file.size <= 20 * 1024 * 1024){ step('Saving the video'); try { url = (await S.assets.upload(file)).url } catch (e){ console.warn(e) } }
          let text = tr; if (JSON.stringify(text).length > 120000){ text = []; let n = 0; for (const l of tr){ n += l.text.length + 20; if (n > 120000) break; text.push(l) } }
          media = {id:uid(), kind:'video', name:file.name, url, duration:Math.round(vid.duration), transcript:text};
          src = {kind:'video', unit:'minutes', units:transcriptUnits(tr), images:frames.map(f => f.blob), frameTimes:frames.map(f => fmtTime(f.t))};
        } else {
          src = await extract(file, step, lim && lim.images ? Math.min(lim.images.maxCount || 5, 8) : 0);
          if (!src.units.some(u => u.text.trim() || u.title) && !src.images.length) throw new Error("NoteTime couldn't find any text in that file.");
          if (src.kind === 'images' && !S.sample) throw new Error('Reading photos needs NoteTime AI. Sign in to your account and try again.');
        }
        let notes;
        if (S.sample) notes = await aiNotes(src, file.name, detail, step, ctl.signal);
        else notes = plainNotes(src);
        step('Building your notebook');
        const pages = notesToPages(notes, file.name);
        if (media){ media.summary = notes.summary || ''; pages[0].media = [media] }
        if (intoNb){
          intoNb.pages.push(...pages); Store.put(intoNb, 50);
          ctl = null; closeModal(); S.page = intoNb.pages.length - pages.length; S.tab = 'notes'; renderNotebook();
          toast(`Added ${pages.length} page${pages.length === 1 ? '' : 's'} from ${file.name}`);
        } else {
          const count = video ? Math.max(1, Math.round((media.duration || 0) / 60)) : (src.units.length || src.images.length);
          const nb = makeNotebook({name:(notes.title || file.name.replace(/\.\w+$/, '')).slice(0, 80), parentId: $('#im-folder', b).value || null, cover:COVERS[(notebooks().length + 2) % COVERS.length], pages,
            settings:{paper:'lined', color:'auto', spacing:'medium', font:'clean', math:true, answers:true, angles:'deg', colors:true},
            source:{name:file.name, count, unit: video ? 'minutes' : src.unit}});
          Store.put(nb, 50); if (nb.parentId) S.expanded.add(nb.parentId);
          ctl = null; closeModal(); go('#nb-' + nb.id);
          toast(`Made ${pages.length} page${pages.length === 1 ? '' : 's'} of notes from ${file.name}`);
        }
      } catch (e){
        console.error(e);
        if (e && e.code === 'cancelled'){ steps.hidden = true; btn.disabled = false; return }
        steps.innerHTML = `<div class="warn">${esc(e && e.code ? aiErr(e) : (e && e.message) || "Couldn't read that file.")}</div>`;
        btn.disabled = false;
      }
    }
  }

  return {openExport, openImport, restoreBackup, renderPage};
})();
