// Import necessary modules from Electron and the path module for handling file paths
const { app, Menu, Tray } = require("electron");
const os = require("os");
const path = require("path");

// Check if the platform is macOS
const isMac = process.platform === "darwin";

// Import the toggleWindow function
const { toggleWindow } = require("./browserWindow.js");

// Import the config object
const config = require("./config.js");

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
    statusMenuItem(win, "Online"),
    statusMenuItem(win, "Away"),
    statusMenuItem(win, "Invisible"),
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
  1: "Online",
  3: "Away",
  7: "Invisible",
};

// Function to create a menu item that sets the user status
function statusMenuItem(win, status) {
  return {
    label: status,
    click: function () {
      // Execute JavaScript in the window to set the user status
      win.webContents.executeJavaScript(
        `this.GetCurrentUserStatusInterface().SetUser${status}();`
      );
    },
  };
}

let currentStatus = null; // Variable to hold the current status

// Function to get the new status
async function getNewStatus(win) {
  // If the window URL is not the chat URL, return null
  if (win.webContents.getURL() !== "https://steamcommunity.com/chat") {
    return null;
  }
  // Execute JavaScript in the window to get the user status
  return await win.webContents.executeJavaScript(
    `this.GetCurrentUserStatusInterface().GetPersonaState();`
  );
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
    click: function () {
      // Clear the storage data and then reload the window
      win.webContents.session.clearStorageData().then(() => {
        win.reload();
      });
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
  setInterval(() => {
    // Exit the function if URL is not 'https://steamcommunity.com/chat'
    if (win.webContents.getURL() !== "https://steamcommunity.com/chat") {
      return;
    }
    win.webContents
      .executeJavaScript(
        "this.g_FriendsUIApp.m_UserStore.m_CMInterface.persona_name;"
      )
      .then((persona_name) => {
        const newTooltip = persona_name
          ? `${persona_name} - steamchat`
          : "steamchat";
        if (newTooltip !== lastTooltip) {
          tray.setToolTip(newTooltip);
          lastTooltip = newTooltip;
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  }, 10000);
}

// Function to create the tray
function createTray(win) {
  tray = new Tray(
    path.join(
      __dirname,
      "..",
      "assets",
      isMac ? "macTrayIcon@2x.png" : "icon.png"
    )
  );

  const { contextMenu, menuItems } = createContextMenu(win, tray);
  tray.setContextMenu(contextMenu);
  handleTrayTooltip(win, tray);

  tray.on("click", () => {
    if (os.platform() !== "darwin") {
      toggleWindow(win); // Toggle the window when the tray is clicked
    }
  });

  // Update the menu labels every second
  setInterval(() => {
    updateMenuLabels(win, [...menuItems]); // Pass a copy of menuItems to avoid mutation
  }, 1000);
}

// Export the functions for use in other modules
module.exports = {
  createTray
};