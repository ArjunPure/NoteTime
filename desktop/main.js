// NoteTime desktop app: opens the NoteTime web app in its own window.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow(){
  const win = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 420,
    minHeight: 520,
    title: 'NoteTime',
    icon: path.join(__dirname, '..', 'img', 'icon-512.png'),
    backgroundColor: '#E9ECF2',
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true }
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
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() });
