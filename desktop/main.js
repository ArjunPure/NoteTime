// NoteTip desktop app: opens the NoteTip web app in its own window and handles updates.
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Notebooks live in the app's data folder. The app was first released as NoteTime,
// so keep using that folder after the rename to NoteTip.
app.setPath('userData', path.join(app.getPath('appData'), 'NoteTime'));

const RELEASES = 'https://github.com/ArjunPure/NoteTip/releases/latest';
let win = null;

// Installed Windows and Linux builds can update themselves. Mac builds aren't signed,
// and the portable Windows build has no installer, so those open the download page instead.
const canSelfUpdate = () => app.isPackaged && process.platform !== 'darwin' && !process.env.PORTABLE_EXECUTABLE_DIR;
const send = (channel, data) => { if (win && !win.isDestroyed()) win.webContents.send(channel, data) };

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.on('download-progress', p => send('update:progress', Math.round(p.percent || 0)));
autoUpdater.on('update-downloaded', info => send('update:ready', info.version));
autoUpdater.on('error', e => send('update:error', String((e && e.message) || e)));

function newer(a, b){
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++){ if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0) }
  return false;
}

ipcMain.handle('app:version', () => app.getVersion());
ipcMain.handle('update:check', async () => {
  if (!app.isPackaged) return null;
  try {
    const r = await autoUpdater.checkForUpdates();
    const v = r && r.updateInfo && r.updateInfo.version;
    if (!v || !newer(v, app.getVersion())) return null;
    return { version: v, current: app.getVersion(), selfUpdate: canSelfUpdate() };
  } catch (e) { return { error: String((e && e.message) || e) } }
});
ipcMain.handle('update:download', async () => {
  if (!canSelfUpdate()){ shell.openExternal(RELEASES); return 'opened' }
  try { await autoUpdater.downloadUpdate(); return 'downloading' }
  catch (e){ shell.openExternal(RELEASES); return 'opened' }
});
ipcMain.handle('update:install', () => { setImmediate(() => autoUpdater.quitAndInstall(false, true)) });
ipcMain.handle('update:open', () => shell.openExternal(RELEASES));

function createWindow(){
  win = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 420,
    minHeight: 520,
    title: 'NoteTip',
    icon: path.join(__dirname, '..', 'img', 'icon-512.png'),
    backgroundColor: '#E9ECF2',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
  // links to other websites open in the normal browser, not inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')){ e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url) }
  });
  win.on('closed', () => { win = null });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
