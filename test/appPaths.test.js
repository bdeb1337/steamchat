const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const { browserWindowIcon } = require("../modules/appPaths.js");

test("browserWindowIcon points at the packaged app icon", () => {
  const moduleDirname = path.join(__dirname, "..", "modules");
  const expected = path.join(__dirname, "..", "assets", "app", "icon.png");

  assert.equal(browserWindowIcon(moduleDirname), expected);
  assert.equal(fs.existsSync(browserWindowIcon(moduleDirname)), true);
});
