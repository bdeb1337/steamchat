// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// All the functions related to creating and handling the BrowserWindow instance
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

module.exports = {
  setWebPreferences,
  createBrowserWindow,
  removeDefaultElectronMenu,
  setDockVisibility,
  hideWindow,
  showWindow,
  handleWindowEvents,
  toggleWindow,
};
