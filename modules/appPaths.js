// Path helpers. This module must not import electron so it stays unit-testable.
const path = require("path");

// Return the application icon path relative to the module directory
function browserWindowIcon(moduleDirname) {
  return path.join(moduleDirname, "..", "assets", "app", "icon.png");
}

module.exports = { browserWindowIcon };
