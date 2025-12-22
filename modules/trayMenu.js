// Import necessary modules from Electron and the path module for handling file paths
const { app, Menu, Tray } = require("electron");
const os = require("os");
const path = require("path");

// Import own modules and constants
const SteamAPI = require("./steamAPI.js");
const { PERSONA_STATE, INTERVALS, STEAM_CHAT_URL } = require("./constants.js");

// Check if the platform is macOS
const isMac = process.platform === "darwin";

// Import the toggleWindow function
const { toggleWindow } = require("./browserWindow.js");

// Import the config object
const config = require("./config.js");

// Create a variable to hold intervals
const intervals = [];

// Create a variable to hold the tray object
let tray = null;

// Create a variable to hold the menu items
let menuItems = [];

// Function to initialize the menu items
function initMenuItems(win, tray) {
  // Define the menu items
  const debugItems = [
    loadURLMenuItem(win, "Return to Chat", "https://steamcommunity.com/chat"),
    clearLocalStorageMenuItem(win),
  ];

  const settingsItems = [
    toggleConfigMenuItem("Minimize on Close", "minimize_on_close", win, tray),
    toggleConfigMenuItem("Minimize to Tray", "minimize_to_tray", win, tray),
    toggleConfigMenuItem("Start Minimized", "start_minimized", win, tray),
    toggleConfigMenuItem("Launch on Startup", "launch_on_startup", win, tray),
  ];

  // Set the menu items
  menuItems = [
    toggleWindowMenuItem(win),
    { type: "separator" },
    createSubmenu(win, "Debug", debugItems),
    createSubmenu(win, "Settings", settingsItems),
    { type: "separator" },
    { label: "Status", enabled: false },
    statusMenuItem(win, "Online", PERSONA_STATE.ONLINE),
    statusMenuItem(win, "Away", PERSONA_STATE.AWAY),
    statusMenuItem(win, "Invisible", PERSONA_STATE.INVISIBLE),
    { type: "separator" },
    quitMenuItem(),
  ];
}

// Function to create a menu item that toggles the window
function toggleWindowMenuItem(win) {
  return {
    label: "Toggle Window",
    click: function () {
      toggleWindow(win); // Toggle the window when clicked
    },
  };
}

// Map of status codes to status labels
const statusMap = {
  [PERSONA_STATE.ONLINE]: "Online",
  [PERSONA_STATE.AWAY]: "Away",
  [PERSONA_STATE.INVISIBLE]: "Invisible",
};

// Function to create a menu item that sets the user status
function statusMenuItem(win, statusLabel, statusCode) {
  return {
    label: statusLabel,
    click: async function () {
      await SteamAPI.execute(win, SteamAPI.setPersonaState(statusCode));
    },
  };
}

let currentStatus = null; // Variable to hold the current status

// Function to check if the window is on the Steam chat page
function isOnChatPage(win) {
  return win && !win.isDestroyed() && win.webContents.getURL() === STEAM_CHAT_URL;
}

// Function to get the new status
async function getNewStatus(win) {
  if (!isOnChatPage(win)) {
    return null;
  }
  
  return await SteamAPI.execute(win, SteamAPI.getPersonaState());
}

// Function to update the status labels in the menu items
function updateStatusLabels(menuItems, newStatus) {
  for (let i = 0; i < menuItems.length; i++) {
    if (menuItems[i].label === statusMap[newStatus]) {
      menuItems[i].label = `• ${menuItems[i].label}`; // Add dot indicator to the current status
    } else if (menuItems[i].label && menuItems[i].label.startsWith("• ")) {
      menuItems[i].label = menuItems[i].label.replace("• ", ""); // Remove dot indicator from other statuses
    }
  }
}

// Function to rebuild the context menu
function rebuildContextMenu(menuItems) {
  const contextMenu = Menu.buildFromTemplate(menuItems);
  tray.setContextMenu(contextMenu); // Set the updated context menu on the tray
}

// Function to update the menu labels
async function updateMenuLabels(win) {
  const newStatus = await getNewStatus(win);

  // If the new status is not null and is different from the current status, update the labels
  if (newStatus !== null && newStatus !== currentStatus) {
    currentStatus = newStatus;
    updateStatusLabels(menuItems, newStatus);
    rebuildContextMenu(menuItems);
  }
}

// Function to create a menu item that clears the local storage
function clearLocalStorageMenuItem(win) {
  return {
    label: "Clear Local Storage",
    click: async function () {
      try {
        await win.webContents.session.clearStorageData();
        win.reload();
      } catch (error) {
        console.error("Failed to clear local storage:", error);
      }
    },
  };
}

// Function to create a menu item that loads a URL
function loadURLMenuItem(win, label, url) {
  return {
    label: label,
    click: function () {
      win.loadURL(url); // Load the URL when clicked
    },
  };
}

// Function to create a menu item that quits the app
function quitMenuItem() {
  return {
    label: "Quit",
    click: function () {
      app.isQuiting = true;
      app.quit(); // Quit the app when clicked
    },
  };
}

// Function to toggle a configuration option and return the new state
function toggleConfigOption(key) {
  const currentState = config.get(key);
  const newState = !currentState;
  config.set(key, newState);
  return newState;
}

// Function to create a menu item that toggles a configuration option
function toggleConfigMenuItem(label, key, win, tray) {
  const menuItem = {
    label: label,
    type: "checkbox",
    checked: config.get(key),
    click: function () {
      const newState = toggleConfigOption(key);
      menuItem.checked = newState; // Update the checked property with the new state

      const { contextMenu } = createContextMenu(win, tray); // Re-create the context menu
      tray.setContextMenu(contextMenu); // Set the updated context menu on the tray
    },
  };

  return menuItem;
}

// Function to create a submenu
function createSubmenu(win, label, items) {
  return {
    label: label,
    submenu: items.map((item) => {
      if (item.url) {
        return loadURLMenuItem(win, item.label, item.url);
      } else if (item.action === "clearLocalStorage") {
        return clearLocalStorageMenuItem(win);
      } else {
        return item;
      }
    }),
  };
}

// Function to create the context menu
function createContextMenu(win, tray) {
  if (menuItems.length === 0) {
    initMenuItems(win, tray);
  }
  const contextMenu = Menu.buildFromTemplate(menuItems);
  return { contextMenu, menuItems };
}

let lastTooltip = ""; // Variable to hold the last tooltip

// Function to handle the tray tooltip
function handleTrayTooltip(win, tray) {
  intervals.push(setInterval(async () => {
    if (!isOnChatPage(win)) {
      return;
    }
    
    const persona_name = await SteamAPI.execute(win, SteamAPI.getPersonaName());
    
    const newTooltip = persona_name
      ? `${persona_name} - steamchat`
      : "steamchat";
    if (newTooltip !== lastTooltip) {
      tray.setToolTip(newTooltip);
      lastTooltip = newTooltip;
    }
  }, INTERVALS.TOOLTIP_UPDATE));
}

// Function to monitor if steamchat is still connected
function monitorConnection(win) {
  intervals.push(setInterval(async () => {
    if (!isOnChatPage(win)) {
      return;
    }
    
    const isConnected = await SteamAPI.execute(win, SteamAPI.isConnected());
    
    if (isConnected === false) {
      console.log("Disconnected from Steam Chat. Reloading...");
      win.webContents.loadURL(STEAM_CHAT_URL);
    }
  }, INTERVALS.CONNECTION_CHECK));
}

// Function to get the appropriate tray icon based on status and unread messages
function getTrayIconPath(status, hasUnread) {
  const statusPrefix = status === PERSONA_STATE.INVISIBLE ? "invisible" : "online";
  const unreadSuffix = hasUnread ? "-unread" : "";
  const platformSuffix = isMac ? "-macTemplate@2x.png" : "-common.png";
  
  const iconName = `${statusPrefix}${unreadSuffix}${platformSuffix}`;
  
  // In production, assets are in the resources folder
  const assetsPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "tray")
    : path.join(__dirname, "..", "assets", "tray");
  
  return path.join(assetsPath, iconName);
}

// Function to update the tray icon
async function updateTrayIcon(win, tray) {
  if (!isOnChatPage(win)) {
    return;
  }
  
  try {
    // Get current status
    const status = await SteamAPI.execute(win, SteamAPI.getPersonaState());
    
    // Get unread message count
    const unreadCount = await SteamAPI.execute(win, SteamAPI.getUnreadFriendMessageCount());
    
    if (status === null || unreadCount === null) {
      return;
    }
    
    // Update tray icon based on status and unread messages
    const hasUnread = unreadCount > 0;
    const iconPath = getTrayIconPath(status, hasUnread);
    
    tray.setImage(iconPath);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to update tray icon:', error);
    }
  }
}

// Function to create the tray
function createTray(win) {
  tray = new Tray(getTrayIconPath(PERSONA_STATE.ONLINE, false)); // Initial icon

  const { contextMenu, menuItems } = createContextMenu(win, tray);
  tray.setContextMenu(contextMenu);
  handleTrayTooltip(win, tray);

  tray.on("click", () => {
    if (os.platform() !== "darwin") {
      toggleWindow(win); // Toggle the window when the tray is clicked
    }
  });

  // Update the menu labels every second
  intervals.push(setInterval(() => {
    updateMenuLabels(win, [...menuItems]); // Pass a copy of menuItems to avoid mutation
  }, INTERVALS.MENU_UPDATE));

  // Update tray icon based on status and unread messages
  intervals.push(setInterval(() => {
    updateTrayIcon(win, tray);
  }, INTERVALS.MENU_UPDATE)); // Use same interval as menu updates

  // Run the monitorConnection function to check if steamchat is still connected
  monitorConnection(win);
}

// Add cleanup function
function cleanupTray() {
  intervals.forEach(id => clearInterval(id));
  intervals.length = 0;
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

// Export the functions for use in other modules
module.exports = {
  createTray,
  cleanupTray,
};