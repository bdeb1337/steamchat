// Import necessary modules from Electron and the path module for handling file paths
const { app, Menu, Tray } = require("electron");
const path = require("path");
const isMac = process.platform === "darwin"; // Check if the platform is macOS
const { toggleWindow } = require("./browserWindow.js"); // Import the toggleWindow function

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
  for (const item of menuItems) {
    if (item.label === statusMap[newStatus]) {
      item.label = `• ${item.label}`; // Add dot indicator to the current status
    } else {
      item.label = item.label.replace("• ", ""); // Remove dot indicator from other statuses
    }
  }
}

// Function to rebuild the context menu
function rebuildContextMenu(menuItems) {
  const contextMenu = Menu.buildFromTemplate(menuItems);
  tray.setContextMenu(contextMenu); // Set the updated context menu on the tray
}

// Function to update the menu labels
async function updateMenuLabels(win, menuItems) {
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
function createContextMenu(win) {
  const debugItems = [
    loadURLMenuItem(win, "Return to Chat", "https://steamcommunity.com/chat"),
    clearLocalStorageMenuItem(win),
  ];

  const menuItems = [
    toggleWindowMenuItem(win),
    { type: "separator" },
    createSubmenu(win, "Debug", debugItems),
    { type: "separator" },
    { label: "Status", enabled: false },
    statusMenuItem(win, "Online"),
    statusMenuItem(win, "Away"),
    statusMenuItem(win, "Invisible"),
    { type: "separator" },
    quitMenuItem(),
  ];

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
    path.join(__dirname, "..", "assets", isMac ? "macTrayIcon@2x.png" : "icon.png")
  );
  const { contextMenu } = createContextMenu(win);
  tray.setContextMenu(contextMenu);
  handleTrayTooltip(win, tray);

  tray.on("click", () => {
    toggleWindow(win); // Toggle the window when the tray is clicked
  });
}

// Export the functions for use in other modules
module.exports = {
    createTray,
    createContextMenu,
    updateMenuLabels,
};