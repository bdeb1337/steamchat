// Import the required modules
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const { app } = require("electron");
const AutoLaunch = require('auto-launch');

// Define the path to the config file
const configPath = path.join(app.getPath("userData"), "steamchat.conf");

// Define the default configuration
const defaultConfig = {
  start_minimized: false,
  minimize_on_close: true,
  minimize_to_tray: false,
  launch_on_startup: false,
  link_os_do_not_disturb: false,
};

let config;

// Functions to load the configuration
function loadConfig() {
  if (configFileExists()) {
    loadExistingConfig();
  } else {
    createNewConfig();
  }
}

function configFileExists() {
  return fs.existsSync(configPath);
}

function loadExistingConfig() {
  try {
    config = yaml.load(fs.readFileSync(configPath, "utf8"));
    updateConfigWithMissingKeys();
  } catch (e) {
    console.error(e);
  }
}

function updateConfigWithMissingKeys() {
  const missingKeys = getMissingKeys();
  if (missingKeys.length > 0) {
    addMissingKeysToConfig(missingKeys);
    writeConfigToFile();
  }
}

function getMissingKeys() {
  const configKeys = Object.keys(config);
  const defaultKeys = Object.keys(defaultConfig);
  return defaultKeys.filter((key) => !configKeys.includes(key));
}

function addMissingKeysToConfig(missingKeys) {
  missingKeys.forEach((key) => {
    config[key] = defaultConfig[key];
  });
}

function writeConfigToFile() {
  fs.writeFileSync(configPath, yaml.dump(config), "utf8");
}

function createNewConfig() {
  try {
    fs.writeFileSync(configPath, yaml.dump(defaultConfig), "utf8");
    config = defaultConfig;
  } catch (e) {
    console.error(e);
  }
}

// Load the configuration
loadConfig();

// Initialise the autoLaunch variable
let autoLaunch = new AutoLaunch({
  name: 'steamchat',
  path: app.getPath('exe'),
});

// Function to check the launch_on_startup configuration option and enable or disable auto-launch accordingly
function checkAutoLaunch() {
  if (config.launch_on_startup) {
    autoLaunch.enable();
  } else {
    autoLaunch.disable();
  }
}

// Watch for changes to the configuration file
fs.watch(configPath, (eventType, filename) => {
  if (eventType === 'change') {
    // Reload the configuration
    loadConfig();
    // Check the launch_on_startup configuration option and enable or disable auto-launch accordingly
    checkAutoLaunch();
  }
});

// Create a separate object for the setters and getters
const configAPI = {
  set: (key, value) => {
    config[key] = value;
    fs.writeFileSync(configPath, yaml.dump(config), "utf8");
  },
  get: (key) => {
    return config[key];
  }
};

module.exports = configAPI;