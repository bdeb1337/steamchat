const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
} = require("electron");
const path = require("path");
const isMac = process.platform === 'darwin';

let tray = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
      devTools: false, // disable developer tools
    },
  });

  // Load a remote URL
  win.loadURL("https://steamcommunity.com/chat");

  // Remove the default Electron menu
  Menu.setApplicationMenu(null)

  win.webContents.setWindowOpenHandler(({ url }) => {
    // In this case, don't create a new window...
    win.loadURL(url);
    return { action: 'deny' };
  });

  // Minimize to tray instead of closing
  win.on("close", function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
    return false;
  });

  // Create a new tray
  tray = new Tray(path.join(__dirname, "assets", isMac ? "macTrayIcon@2x.png" : "icon.png"));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Toggle Window",
      click: function () {
        if (win.isVisible()) {
          win.hide();
        } else {
          win.show();
        }
      },
    },
    {
      label: "Online",
      click: function () {
        win.webContents.executeJavaScript(
          "this.GetCurrentUserStatusInterface().SetUserOnline();"
        );
      },
    },
    {
      label: "Away",
      click: function () {
        win.webContents.executeJavaScript(
          "this.GetCurrentUserStatusInterface().SetUserAway();"
        );
      },
    },
    {
      label: "Invisible",
      click: function () {
        win.webContents.executeJavaScript(
          "this.GetCurrentUserStatusInterface().SetUserInvisible();"
        );
      },
    },
    {
      label: "Quit",
      click: function () {
        if (process.platform !== 'darwin') {
          app.isQuiting = true;
          app.quit();
        } else {
          win.close();
        }
      },
    },
  ]);

  tray.setToolTip("steamchat");
  tray.setContextMenu(contextMenu);

  // Show the app when the tray icon is clicked
  tray.on("click", function () {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  app.isQuiting = true;
  tray.destroy();
});

// Handle the 'notify' event
ipcMain.on("notify", (event, { title, opt }) => {
  const notification = new Notification({
    title: title,
    body: opt.body,
    icon: path.join(__dirname, "assets", "logo.png"),
  });

  notification.show();

  notification.on("click", () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
});
