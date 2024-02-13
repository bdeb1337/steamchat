// Import necessary modules from Electron and the path module for handling file paths
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// Import the config object
const config = require("./config.js");

// Function to set web preferences for the BrowserWindow
function setWebPreferences() {
  return {
    nodeIntegration: false, // Disable Node.js integration in the renderer process
    contextIsolation: true, // Protect against prototype pollution
    enableRemoteModule: false, // Turn off remote module
    preload: path.join(__dirname, "preload.js"), // Use a preload script
  };
}

// Function to create a new BrowserWindow
function createBrowserWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "assets", "icon.png"),
    show: !config.get("start_minimized"), // Show the window if start_minimized is false
    webPreferences: setWebPreferences(), // Set the web preferences
  });

  // Load the initial URL
  win.loadURL("https://steamcommunity.com/chat");

  return win;
}

// Function to remove the default Electron menu
function removeDefaultElectronMenu(win) {
  if (process.env.NODE_ENV === "production") {
    Menu.setApplicationMenu(null); // Remove the application menu
    // Close the devtools if they are opened
    win.webContents.on("devtools-opened", () => {
      win.webContents.closeDevTools();
    });
  }
}

// Function to set the visibility of the dock (Mac only)
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

// Function to hide the window and the dock (Mac only)
function hideWindow(win) {
  win.hide();
  setDockVisibility(false);
}

// Function to show the window and the dock (Mac only)
function showWindow(win) {
  win.show();
  setDockVisibility(true);
}

// Function to handle window events
function handleWindowEvents(win) {
  // Prevent new windows from being opened and redirect the navigation to the current window
  win.webContents.setWindowOpenHandler(({ url }) => {
    win.loadURL(url);
    return { action: "deny" };
  });

  // Prevent the window from being closed, instead hide it
  win.on("close", function (event) {
    if (!app.isQuiting && config.get("minimize_on_close")) {
      event.preventDefault();
      hideWindow(win);
    }else{
      app.quit();
    }
    return false;
  });

  // Prevent the window from being minimized, instead hide it
  win.on("minimize", function (event) {
    if (config.get("minimize_to_tray")) {
      event.preventDefault();
      hideWindow(win);
    }
  });
}

// Function to toggle the visibility of the window
function toggleWindow(win) {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
  }
}

// Export the functions for use in other modules
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