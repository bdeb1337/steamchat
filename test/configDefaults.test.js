const test = require("node:test");
const assert = require("node:assert/strict");

const { mergeConfigDefaults } = require("../modules/configDefaults.js");

const defaults = {
  start_minimized: false,
  minimize_on_close: true,
  minimize_to_tray: false,
  launch_on_startup: false,
  link_os_do_not_disturb: false,
};

test("mergeConfigDefaults fills missing keys with defaults", () => {
  const merged = mergeConfigDefaults({ minimize_on_close: false }, defaults);

  assert.deepEqual(merged, {
    start_minimized: false,
    minimize_on_close: false,
    minimize_to_tray: false,
    launch_on_startup: false,
    link_os_do_not_disturb: false,
  });
});

test("mergeConfigDefaults preserves false, null, zero and empty strings", () => {
  const merged = mergeConfigDefaults(
    { start_minimized: null, minimize_on_close: false, minimize_to_tray: 0, launch_on_startup: "" },
    defaults
  );

  assert.equal(merged.start_minimized, null);
  assert.equal(merged.minimize_on_close, false);
  assert.equal(merged.minimize_to_tray, 0);
  assert.equal(merged.launch_on_startup, "");
  assert.equal(merged.link_os_do_not_disturb, false);
});

test("mergeConfigDefaults keeps extra keys", () => {
  const merged = mergeConfigDefaults({ custom_option: "kept" }, defaults);

  assert.equal(merged.custom_option, "kept");
  assert.equal(merged.minimize_on_close, true);
});

test("mergeConfigDefaults does not mutate the defaults object", () => {
  const snapshot = { ...defaults };
  const merged = mergeConfigDefaults({ minimize_on_close: false }, defaults);
  merged.start_minimized = true;

  assert.deepEqual(defaults, snapshot);
});

test("mergeConfigDefaults returns a fresh defaults copy for invalid input", () => {
  for (const loaded of [null, "not an object", ["array", "input"]]) {
    const merged = mergeConfigDefaults(loaded, defaults);

    assert.deepEqual(merged, defaults);
    assert.notEqual(merged, defaults);
  }
});
