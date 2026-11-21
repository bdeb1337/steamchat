// URL policy helpers. This module must not import electron so it stays unit-testable.

// Parse a URL and return its normalised hostname, or null when the URL is invalid.
function getHostname(url) {
  try {
    let hostname = new URL(url).hostname.toLowerCase();
    // Ignore a single trailing dot, e.g. "steamcommunity.com.".
    if (hostname.endsWith(".")) {
      hostname = hostname.slice(0, -1);
    }
    return hostname || null;
  } catch {
    return null;
  }
}

// Check if URL belongs to Steam Community or Steam Store (or their subdomains)
function isSteamDomain(url) {
  const hostname = getHostname(url);
  if (!hostname) {
    return false;
  }

  return (
    hostname === "steamcommunity.com" ||
    hostname === "steampowered.com" ||
    hostname.endsWith(".steamcommunity.com") ||
    hostname.endsWith(".steampowered.com")
  );
}

// Check if URL can safely be opened in the user's browser
function isAllowedExternalUrl(url) {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// Extract the destination URL from a Steam linkfilter URL, if it is safe
function extractLinkFilterUrl(url) {
  if (!isSteamDomain(url)) {
    return null;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  if (parsedUrl.pathname !== "/linkfilter" && parsedUrl.pathname !== "/linkfilter/") {
    return null;
  }

  const target = parsedUrl.searchParams.get("u");
  if (!target) {
    return null;
  }

  if (isAllowedExternalUrl(target)) {
    return target;
  }

  // Steam sometimes double-encodes the destination URL.
  try {
    const decodedTarget = decodeURIComponent(target);
    if (isAllowedExternalUrl(decodedTarget)) {
      return decodedTarget;
    }
  } catch {
    return null;
  }

  return null;
}

module.exports = {
  isSteamDomain,
  isAllowedExternalUrl,
  extractLinkFilterUrl,
};
