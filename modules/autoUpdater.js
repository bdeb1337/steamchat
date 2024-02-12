// Import the dialog module from Electron for native dialogs
const { dialog } = require('electron');

// Import the autoUpdater module from 'electron-updater' for handling updates
const { autoUpdater } = require('electron-updater');

// Check for updates and notify the user if an update is available
autoUpdater.checkForUpdatesAndNotify();

// Event triggered when an update is available
autoUpdater.on("update-available", () => {
  // Show a dialog to the user indicating an update is available
  dialog
    .showMessageBox({
      type: "info",
      title: "Update available",
      message:
        "A new version of the app is available. Would you like to download it now?",
      buttons: ["Yes", "No"],
    })
    .then((result) => {
      // If the user clicked 'Yes', start downloading the update
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
});

// Event triggered when an update has been downloaded
autoUpdater.on("update-downloaded", () => {
  // Show a dialog to the user asking if they want to install the update now
  dialog.showMessageBox(
    {
      type: "info",
      title: "Update ready",
      message: "Install and restart now?",
      buttons: ["Yes", "Later"],
    },
    (response) => {
      // If the user clicked 'Yes', quit the app and install the update
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    }
  );
});