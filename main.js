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
  dialog
    .showMessageBox({
      type: "info",
      title: "Update available",
      message:
        "A new version of the app is available. Would you like to download it now?",
      buttons: ["Yes", "No"],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox(
    {
      type: "info",
      title: "Update ready",
      message: "Install and restart now?",
      buttons: ["Yes", "Later"],
    },
    (response) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    }
  );
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

function setDockVisibility(visible) {
  if (process.platform !== "darwin") {
    return;
  }

  if (visible) {
    app.dock.show();
  } else {
    app.dock.hide();
  }
}

function hideWindow(win) {
  win.hide();
  setDockVisibility(false);
}

function showWindow(win) {
  win.show();
  setDockVisibility(true);
}

function handleWindowEvents(win) {
  win.webContents.setWindowOpenHandler(({ url }) => {
    win.loadURL(url);
    return { action: "deny" };
  });

  win.on("close", function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      hideWindow(win);
    }
    return false;
  });

  win.on("minimize", function (event) {
    event.preventDefault();
    hideWindow(win);
  });
}

function toggleWindow(win) {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
  }
}

function toggleWindowMenuItem(win) {
  return {
    label: "Toggle Window",
    click: function () {
      toggleWindow(win);
    },
  };
}

const statusMap = {
  1: "Online",
  3: "Away",
  7: "Invisible",
};

function statusMenuItem(win, status) {
  return {
    label: status,
    click: function () {
      win.webContents.executeJavaScript(
        `this.GetCurrentUserStatusInterface().SetUser${status}();`
      );
    },
  };
}

let currentStatus = null;

async function updateMenuLabels(win, menuItems) {
  const newStatus = await win.webContents.executeJavaScript(
    `this.GetCurrentUserStatusInterface().GetPersonaState();`
  );

  if (newStatus !== currentStatus) {
    currentStatus = newStatus;

    for (const item of menuItems) {
      if (item.label === statusMap[currentStatus]) {
        item.label = `• ${item.label}`; // Add dot indicator to the current status
      } else {
        item.label = item.label.replace("• ", ""); // Remove dot indicator from other statuses
      }
    }

    // Rebuild the context menu with the updated menu items
    const contextMenu = Menu.buildFromTemplate(menuItems);
    tray.setContextMenu(contextMenu); // Set the updated context menu on the tray
  }
}

function quitMenuItem() {
  return {
    label: "Quit",
    click: function () {
      app.isQuiting = true;
      app.quit();
    },
  };
}

function createContextMenu(win) {
  const menuItems = [
    toggleWindowMenuItem(win),
    statusMenuItem(win, "Online"),
    statusMenuItem(win, "Away"),
    statusMenuItem(win, "Invisible"),
    quitMenuItem(),
  ];

  const contextMenu = Menu.buildFromTemplate(menuItems);
  return { contextMenu, menuItems };
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
  const { contextMenu } = createContextMenu(win);
  tray.setContextMenu(contextMenu);
  handleTrayTooltip(win, tray);

  tray.on('click', () => {
    toggleWindow(win);
  });
}

function createWindow() {
  const win = createBrowserWindow();
  removeDefaultElectronMenu(win);
  handleWindowEvents(win);

  const { contextMenu, menuItems } = createContextMenu(win);
  createTray(win, contextMenu);

  // Call updateMenuLabels every second to keep it up to date.
  setInterval(() => {
    updateMenuLabels(win, [...menuItems]); // Pass a copy of menuItems to avoid mutation
  }, 1000);
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