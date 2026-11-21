// Configuration helpers. This module must not import electron so it stays unit-testable.

// Merge loaded configuration with defaults without overwriting present values
function mergeConfigDefaults(loaded, defaults) {
  if (loaded === null || typeof loaded !== "object" || Array.isArray(loaded)) {
    return { ...defaults };
  }

  const merged = { ...loaded };
  for (const key of Object.keys(defaults)) {
    if (!Object.prototype.hasOwnProperty.call(merged, key)) {
      merged[key] = defaults[key];
    }
  }
  return merged;
}

module.exports = { mergeConfigDefaults };
