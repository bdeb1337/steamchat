// Import necessary modules from Electron and the path module for handling file paths
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

// Import constants
const { STEAM_CHAT_URL, INTERVALS } = require("./constants.js");

// Import the config object
const config = require("./config.js");

// Function to set web preferences for the BrowserWindow
function setWebPreferences() {
  return {
    nodeIntegration: false, // Disable Node.js integration in the renderer process
    contextIsolation: true, // Protect against prototype pollution
    enableRemoteModule: false, // Turn off remote module
    preload: path.join(__dirname, "preload.js"), // Use a preload script
    devTools: process.env.NODE_ENV !== 'production', // Disable devTools in production
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
  win.loadURL(STEAM_CHAT_URL);

  // Handle page load failures
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    // Ignore certain error codes (like aborted loads)
    if (errorCode === -3) return; // ERR_ABORTED
    
    console.error(`Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
    
    // Retry loading after a delay
    setTimeout(() => {
      console.log('Retrying to load Steam Chat...');
      win.loadURL(STEAM_CHAT_URL);
    }, INTERVALS.RELOAD_RETRY);
  });

  // When the window is ready, disable next-page and previous-page mouse buttons
  win.webContents.on('dom-ready', () => {
    disableMouseNavigation(win);
  });

  // Control link navigation
  controlLinkNavigation(win);

  return win;
}

// Helper function to check if URL is a Steam domain
function isSteamDomain(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.endsWith('steamcommunity.com') || 
           parsedUrl.hostname.endsWith('steampowered.com');
  } catch {
    return false;
  }
}

// Helper function to extract URL from Steam's linkfilter
function extractLinkFilterUrl(url) {
  try {
    const parsedUrl = new URL(url);
    
    // Check if it's a linkfilter URL
    if (parsedUrl.pathname === '/linkfilter/' || parsedUrl.pathname === '/linkfilter') {
      // Extract the 'u' parameter which contains the actual URL
      const actualUrl = parsedUrl.searchParams.get('u');
      if (actualUrl) {
        return decodeURIComponent(actualUrl);
      }
    }
  } catch {
    return null;
  }
  
  return null;
}

// Function to control link navigation
function controlLinkNavigation(win) {
  const { shell } = require('electron');

  // Handle links clicked within the page (including redirects)
  win.webContents.on('will-navigate', (event, url) => {
    // Check if it's a linkfilter URL
    const actualUrl = extractLinkFilterUrl(url);
    if (actualUrl) {
      event.preventDefault();
      shell.openExternal(actualUrl);
      return;
    }
    
    // If navigating away from Steam chat to external site
    if (!isSteamDomain(url) && win.webContents.getURL() === STEAM_CHAT_URL) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

// Function to disable mouse navigation
function disableMouseNavigation(win) {
  const disableNavigationScript = `
    document.addEventListener('mouseup', (event) => {
      if (event.button === 3 || event.button === 4) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  `;
  win.webContents.executeJavaScript(disableNavigationScript);
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

// Function to show and focus the window and to show the dock (Mac only)
function showWindow(win) {
  setDockVisibility(true);
  // Bring app and window to foreground
  win.show();
  app.focus({ steal: true });
  win.focus();
}

// Function to handle window events
function handleWindowEvents(win) {
  const { shell } = require('electron');

  // Handle new windows (window.open, target="_blank", etc.)
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Check if it's a linkfilter URL
    const actualUrl = extractLinkFilterUrl(url);
    if (actualUrl) {
      shell.openExternal(actualUrl);
      return { action: "deny" };
    }
  
    // If it's a Steam domain, open in the same window
    if (isSteamDomain(url)) {
      win.loadURL(url);
      return { action: "deny" };
    }

    // Otherwise open externally
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Prevent the window from being closed, instead hide it
  win.on("close", function (event) {
    if (!app.isQuiting && config.get("minimize_on_close")) {
      event.preventDefault();
      hideWindow(win);
    } else {
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
    hideWindow(win);
  } else {
    showWindow(win);
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
  controlLinkNavigation,
};