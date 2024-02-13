// Import the required modules
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const { app } = require("electron");

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

// Check if the config file exists
if (fs.existsSync(configPath)) {
  // If it exists, read it and check if it has the same keys as the default configuration
  try {
    config = yaml.load(fs.readFileSync(configPath, "utf8"));
    const configKeys = Object.keys(config);
    const defaultKeys = Object.keys(defaultConfig);
    const missingKeys = defaultKeys.filter((key) => !configKeys.includes(key));
    if (missingKeys.length > 0) {
      // If it's missing keys, add them to the config and write the file
      missingKeys.forEach((key) => {
        config[key] = defaultConfig[key];
      });
      fs.writeFileSync(configPath, yaml.dump(config), "utf8");
    }
  } catch (e) {
    console.error(e);
  }
} else {
  // If it doesn't exist, create it with the default configuration
  try {
    fs.writeFileSync(configPath, yaml.dump(defaultConfig), "utf8");
    config = defaultConfig;
  } catch (e) {
    console.error(e);
  }
}

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