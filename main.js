// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
} = require("electron");

// Variables
const path = require("path");
const isMac = process.platform === "darwin";
let tray = null;

// AutoUpdater
const { autoUpdater } = require("electron-updater");
autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on("update-available", () => {
  // Notify user that an update is available
});

autoUpdater.on("update-downloaded", () => {
  // Notify user that the update is ready to be installed
});

// Web preferences options
function setWebPreferences() {
  return {
    nodeIntegration: false, // is default value after Electron v5
    contextIsolation: true, // protect against prototype pollution
    enableRemoteModule: false, // turn off remote
    preload: path.join(__dirname, "preload.js"), // use a preload script
  };
}

function createBrowserWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "assets", "icon.png"),
    show: false,
    webPreferences: setWebPreferences(),
  });

  win.loadURL("https://steamcommunity.com/chat");

  return win;
}

function removeDefaultElectronMenu(win) {
  if (process.env.NODE_ENV === "production") {
    Menu.setApplicationMenu(null);
    win.webContents.on("devtools-opened", () => {
      win.webContents.closeDevTools();
    });
  }
}

function handleWindowEvents(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    win.loadURL(url);
    return { action: "deny" };
  });

  win.on("close", function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
      if (process.platform === "darwin") {
        app.dock.hide();
      }
    }
    return false;
  });

  win.on("minimize", function (event) {
    event.preventDefault();
    win.hide();
    if (process.platform === "darwin") {
      app.dock.hide();
    }
  });
}

function createContextMenu(win) {
  return Menu.buildFromTemplate([
    {
      label: "Toggle Window",
      click: function () {
        if (win.isVisible()) {
          win.hide();
          if (process.platform === "darwin") {
            app.dock.hide();
          }
        } else {
          win.show();
          if (process.platform === "darwin") {
            app.dock.show();
          }
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
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);
}

function handleTrayTooltip(win, tray) {
  setInterval(() => {
    win.webContents
      .executeJavaScript(
        "this.g_FriendsUIApp.m_UserStore.m_CMInterface.persona_name;"
      )
      .then((persona_name) => {
        if (persona_name) {
          tray.setToolTip(`${persona_name} - steamchat`);
        } else {
          tray.setToolTip("steamchat");
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  }, 10000);
}

function createTray(win) {
  tray = new Tray(
    path.join(__dirname, "assets", isMac ? "macTrayIcon@2x.png" : "icon.png")
  );
  const contextMenu = createContextMenu(win);
  tray.setContextMenu(contextMenu);
  handleTrayTooltip(win, tray);
}

function createWindow() {
  const win = createBrowserWindow();
  removeDefaultElectronMenu(win);
  handleWindowEvents(win);
  createTray(win);
}

// App events
app.whenReady().then(() => {
  createWindow();
  if (process.platform === "darwin") {
    app.dock.hide();
  }
});

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