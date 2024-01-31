const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  Tray,
  Menu,
} = require("electron");

// Auto Updater
const { autoUpdater } = require("electron-updater");
autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on("update-available", () => {
  // Notify user that an update is available
});

autoUpdater.on("update-downloaded", () => {
  // Notify user that the update is ready to be installed
});

const path = require("path");
const isMac = process.platform === "darwin";

let tray = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "assets", "icon.png"),
    show: false,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js"), // use a preload script
      devTools: process.env.NODE_ENV !== "production", // disable developer tools
    },
  });

  // Load a remote URL
  win.loadURL("https://steamcommunity.com/chat");

  // Remove the default Electron menu
  if (process.env.NODE_ENV === "production") {
    Menu.setApplicationMenu(null);
    win.webContents.on("devtools-opened", () => {
      win.webContents.closeDevTools();
    });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    // In this case, don't create a new window...
    win.loadURL(url);
    return { action: "deny" };
  });

  // Minimize to tray instead of closing
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

  // Minimize to tray instead of minimizing to taskbar
  win.on("minimize", function (event) {
    event.preventDefault();
    win.hide();
    if (process.platform === "darwin") {
      app.dock.hide();
    }
  });

  // Create a new tray
  tray = new Tray(
    path.join(__dirname, "assets", isMac ? "macTrayIcon@2x.png" : "icon.png")
  );
  const contextMenu = Menu.buildFromTemplate([
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

  // Handle tray tooltip (persona name)
  tray.setToolTip("steamchat");
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
  tray.setContextMenu(contextMenu);
}

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
