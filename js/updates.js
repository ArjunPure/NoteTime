"use strict";
/* NoteTip updates: a banner at the top of the screen when a newer version is available. */
const Updates = (() => {
  const NOTES_URL = 'https://raw.githubusercontent.com/ArjunPure/NoteTip/main/version.json';
  let shown = null, lastCheck = 0, offs = [];
  const newer = (a, b) => { const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number); for (let i = 0; i < 3; i++){ if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0) } return false };
  async function notesFor(version, url){
    try { const r = await fetch(url + '?t=' + Date.now(), {cache:'no-store'}); const v = await r.json(); return v && v.version === version && Array.isArray(v.notes) ? v.notes : [] } catch { return [] }
  }
  async function check(){
    if (shown || Date.now() - lastCheck < 30 * 60e3) return;
    lastCheck = Date.now();
    try {
      if (window.NTDesktop){
        const r = await window.NTDesktop.checkForUpdate();
        if (r && r.version) show({version:r.version, current:r.current, selfUpdate:r.selfUpdate, notes:await notesFor(r.version, NOTES_URL), kind:'desktop'});
        return;
      }
      if (!window.NT_STANDALONE || !window.NT_VERSION) return;
      const r = await fetch('version.json?t=' + Date.now(), {cache:'no-store'}); if (!r.ok) return;
      const v = await r.json();
      if (v && v.version && newer(v.version, window.NT_VERSION)) show({version:v.version, current:window.NT_VERSION, notes:v.notes || [], kind:'web'});
    } catch {}
  }
  function show(info){
    shown = info;
    const old = $('.upd'); if (old) old.parentNode.removeChild(old);
    const d = document.createElement('div'); d.className = 'upd'; d.setAttribute('role', 'alertdialog'); d.setAttribute('aria-label', 'Update available');
    d.innerHTML = `<img class="upd-logo" src="${LOGO}" alt="">
      <div class="upd-t"><b>NoteTip ${esc(info.version)} is here</b>
        <span>${info.notes.length ? info.notes.slice(0, 3).map(esc).join(' · ') : 'A new version is ready with fixes and improvements.'}</span>
        <small>You have ${esc(info.current)}</small>
        <div class="upd-bar" hidden><i></i></div></div>
      <div class="upd-a"><button class="btn upd-go" id="upd-go">Update now</button><button class="btn ghost upd-later" id="upd-later">Later</button></div>`;
    document.body.appendChild(d);
    requestAnimationFrame(() => d.classList.add('in'));
    $('#upd-later', d).onclick = hide;
    $('#upd-go', d).onclick = () => start(d, info);
  }
  function hide(){
    const d = $('.upd'); if (!d) return;
    d.classList.remove('in');
    setTimeout(() => { if (d.parentNode) d.parentNode.removeChild(d) }, 300);
    offs.forEach(f => f()); offs = [];
  }
  const status = (d, text) => { $('.upd-t span', d).textContent = text };
  async function start(d, info){
    const go = $('#upd-go', d), later = $('#upd-later', d);
    try { Store.flushAll() } catch {}
    if (info.kind === 'web'){
      go.disabled = true; status(d, 'Updating…');
      try {
        const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
        if (reg) await reg.update();
        const names = await caches.keys();
        for (const n of names) await caches['delete'](n);
      } catch {}
      setTimeout(() => location.reload(), 400);
      return;
    }
    if (!info.selfUpdate){
      await window.NTDesktop.downloadUpdate();
      status(d, 'The download page opened in your browser. Install the new version, then open NoteTip again. Your notebooks stay on this computer.');
      go.textContent = 'Open download page again'; go.onclick = () => window.NTDesktop.openDownloads(); later.textContent = 'Close';
      return;
    }
    go.disabled = true; later.hidden = true;
    const bar = $('.upd-bar', d); bar.hidden = false; status(d, 'Downloading the update…');
    offs.push(window.NTDesktop.on('update:progress', p => { $('i', bar).style.width = p + '%'; status(d, `Downloading the update… ${p}%`) }));
    offs.push(window.NTDesktop.on('update:ready', () => {
      bar.hidden = true; status(d, 'Update downloaded. NoteTip restarts to finish, and your notebooks are kept.');
      go.disabled = false; go.textContent = 'Restart now';
      go.onclick = () => { try { Store.flushAll() } catch {} setTimeout(() => window.NTDesktop.installUpdate(), 300) };
      later.hidden = false; later.textContent = 'Restart later';
    }));
    offs.push(window.NTDesktop.on('update:error', () => {
      bar.hidden = true; go.disabled = false; later.hidden = false;
      status(d, "The update couldn't download here. Get it from the download page instead.");
      go.textContent = 'Open download page'; go.onclick = () => window.NTDesktop.openDownloads();
    }));
    const r = await window.NTDesktop.downloadUpdate();
    if (r === 'opened'){ bar.hidden = true; later.hidden = false; go.disabled = false; status(d, 'The download page opened in your browser. Install the new version, then open NoteTip again.') }
  }
  setTimeout(check, 2500);
  setInterval(check, 6 * 3600e3);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check() });
  return {check, show};
})();
