// Import necessary modules from Electron
const { app, BrowserWindow, ipcMain, Notification } = require("electron");

// Import functions from the browserWindow and trayMenu modules
const {
  createBrowserWindow,
  removeDefaultElectronMenu,
  handleWindowEvents,
  hideWindow,
} = require("./modules/browserWindow.js");

const {
  createContextMenu,
  updateMenuLabels,
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

// Handle the 'notify' event
ipcMain.on("notify", (event, { title, opt }) => {
  // Create a new notification
  const notification = new Notification({
    title: title,
    body: opt.body,
    icon: path.join(__dirname, "assets", "logo.png"),
  });

  // Show the notification
  notification.show();

  // When the notification is clicked, focus the window
  notification.on("click", () => {
    // Use the exposed showWindow function
    showWindow(win);
  });
});