// Import necessary modules from Electron
const { app, BrowserWindow, ipcMain, Notification, shell } = require("electron");

// Import functions from the browserWindow and trayMenu modules
const {
  createBrowserWindow,
  removeDefaultElectronMenu,
  handleWindowEvents,
  hideWindow,
  showWindow,
} = require("./modules/browserWindow.js");

const {
  createTray,
} = require("./modules/trayMenu.js");

// Import the config object
const config = require("./modules/config.js");

// Import the path module for handling file paths
const path = require("path");

// Initialise the win variable
let win = null;

// Initialise the tray variable
let tray = null;

// Check if the app is running on a Mac
const isMac = process.platform === "darwin";

// Function to create a new window
function createWindow() {
  // Create a new BrowserWindow
  win = createBrowserWindow();

  // Remove the default Electron menu
  removeDefaultElectronMenu(win);

  // Handle window events
  handleWindowEvents(win);

  // Create the tray icon
  tray = createTray(win);
}

// When the app is ready, create a window and hide the dock if on a Mac
app.whenReady().then(() => {
  createWindow();
  // If the app is running on a Mac and the start_minimized configuration option is true, hide the dock
  if (isMac && config.get('start_minimized')) {
    hideWindow(win);
  }
});

// When all windows are closed, quit the app unless it's on a Mac
app.on("window-all-closed", () => {
  // If the app is not running on a Mac, quit the app
  if (!isMac) {
    app.quit();
  }
});

// When the app is activated, create a window if there isn't one already
app.on("activate", () => {
  // If there are no windows, create a new one
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Before the app quits, set app.isQuiting to true and destroy the tray icon
app.on("before-quit", () => {
  // Set app.isQuiting to true
  app.isQuiting = true;
  // Destroy the tray icon
  if (tray){
    tray.destroy();
  }
});

// When a notification is clicked, show the window
ipcMain.on('notification-click', () => {
  showWindow(win);
});

// When an open-external event is received, open the URL in the default browser
ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});