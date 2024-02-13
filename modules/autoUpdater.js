// Import the autoUpdater module from 'electron-updater' for handling updates
const { autoUpdater } = require('electron-updater');

// Check for updates and notify the user if an update is available
autoUpdater.checkForUpdatesAndNotify();