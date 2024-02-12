const { dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

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