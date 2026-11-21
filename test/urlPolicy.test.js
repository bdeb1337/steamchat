const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isSteamDomain,
  isAllowedExternalUrl,
  extractLinkFilterUrl,
} = require("../modules/urlPolicy.js");

test("isSteamDomain accepts exact Steam hosts and their subdomains", () => {
  assert.equal(isSteamDomain("https://steamcommunity.com/chat"), true);
  assert.equal(isSteamDomain("https://steampowered.com/"), true);
  assert.equal(isSteamDomain("https://www.steamcommunity.com/chat"), true);
  assert.equal(isSteamDomain("https://store.steampowered.com/app/1"), true);
  assert.equal(isSteamDomain("https://chat.steamcommunity.com/"), true);
});

test("isSteamDomain normalises case and a trailing dot", () => {
  assert.equal(isSteamDomain("HTTPS://STEAMCOMMUNITY.COM/chat"), true);
  assert.equal(isSteamDomain("https://SteamCommunity.COM/chat"), true);
  assert.equal(isSteamDomain("https://steamcommunity.com./chat"), true);
  assert.equal(isSteamDomain("https://store.steampowered.com./app/1"), true);
});

test("isSteamDomain rejects lookalike and non-Steam hosts", () => {
  assert.equal(isSteamDomain("https://notsteamcommunity.com/"), false);
  assert.equal(isSteamDomain("https://steamcommunity.com.evil.com/"), false);
  assert.equal(isSteamDomain("https://evilsteampowered.com/"), false);
  assert.equal(isSteamDomain("https://example.com/"), false);
  assert.equal(
    isSteamDomain("https://evil.com/?next=https://steamcommunity.com/chat"),
    false
  );
  assert.equal(isSteamDomain("https://steamcommunity.com@evil.com/"), false);
});

test("isSteamDomain rejects invalid, empty and non-web URLs", () => {
  assert.equal(isSteamDomain(""), false);
  assert.equal(isSteamDomain("not a url"), false);
  assert.equal(isSteamDomain("javascript:alert(1)"), false);
  assert.equal(isSteamDomain("file:///etc/passwd"), false);
  assert.equal(isSteamDomain("data:text/html,hello"), false);
  assert.equal(isSteamDomain(null), false);
  assert.equal(isSteamDomain(undefined), false);
});

test("isAllowedExternalUrl only accepts http and https", () => {
  assert.equal(isAllowedExternalUrl("http://example.com/path"), true);
  assert.equal(isAllowedExternalUrl("https://example.com/path"), true);
  assert.equal(isAllowedExternalUrl("HTTPS://EXAMPLE.COM/path"), true);
  assert.equal(isAllowedExternalUrl("ftp://example.com/file"), false);
  assert.equal(isAllowedExternalUrl("mailto:someone@example.com"), false);
  assert.equal(isAllowedExternalUrl("javascript:alert(1)"), false);
  assert.equal(isAllowedExternalUrl("file:///etc/passwd"), false);
  assert.equal(isAllowedExternalUrl("data:text/html,hello"), false);
  assert.equal(isAllowedExternalUrl(""), false);
  assert.equal(isAllowedExternalUrl("not a url"), false);
});

test("extractLinkFilterUrl returns the encoded destination from Steam linkfilter URLs", () => {
  assert.equal(
    extractLinkFilterUrl(
      "https://steamcommunity.com/linkfilter/?u=https%3A%2F%2Fexample.com%2Fpath"
    ),
    "https://example.com/path"
  );
  assert.equal(
    extractLinkFilterUrl(
      "https://store.steampowered.com/linkfilter?u=https%3A%2F%2Fexample.com%2Fpath"
    ),
    "https://example.com/path"
  );
});

test("extractLinkFilterUrl handles unencoded destinations", () => {
  assert.equal(
    extractLinkFilterUrl("https://steamcommunity.com/linkfilter/?u=https://example.com/path"),
    "https://example.com/path"
  );
  assert.equal(
    extractLinkFilterUrl("https://steamcommunity.com/linkfilter?u=http://example.com/"),
    "http://example.com/"
  );
});

test("extractLinkFilterUrl decodes a double-encoded destination", () => {
  assert.equal(
    extractLinkFilterUrl(
      "https://steamcommunity.com/linkfilter/?u=https%253A%252F%252Fexample.com"
    ),
    "https://example.com"
  );
});

test("extractLinkFilterUrl rejects non-Steam linkfilter URLs", () => {
  assert.equal(
    extractLinkFilterUrl("https://evil.com/linkfilter?u=https://example.com"),
    null
  );
  assert.equal(
    extractLinkFilterUrl("https://notsteamcommunity.com/linkfilter/?u=https://example.com"),
    null
  );
});

test("extractLinkFilterUrl rejects unsafe destinations", () => {
  assert.equal(
    extractLinkFilterUrl("https://steamcommunity.com/linkfilter/?u=javascript%3Aalert(1)"),
    null
  );
  assert.equal(
    extractLinkFilterUrl("https://steamcommunity.com/linkfilter/?u=file%3A%2F%2F%2Fetc%2Fpasswd"),
    null
  );
  assert.equal(
    extractLinkFilterUrl("https://steamcommunity.com/linkfilter/?u=data%3Atext%2Fhtml%2Chi"),
    null
  );
  assert.equal(
    extractLinkFilterUrl("https://steamcommunity.com/linkfilter/?u=ftp%3A%2F%2Fexample.com"),
    null
  );
});

test("extractLinkFilterUrl ignores Steam URLs that are not linkfilter URLs", () => {
  assert.equal(extractLinkFilterUrl("https://steamcommunity.com/chat"), null);
  assert.equal(
    extractLinkFilterUrl("https://steamcommunity.com/chat?u=https://example.com"),
    null
  );
  assert.equal(extractLinkFilterUrl("https://steamcommunity.com/linkfiltered/?u=https%3A%2F%2Fexample.com"), null);
});

test("extractLinkFilterUrl returns null for missing or empty u", () => {
  assert.equal(extractLinkFilterUrl("https://steamcommunity.com/linkfilter/"), null);
  assert.equal(extractLinkFilterUrl("https://steamcommunity.com/linkfilter/?u="), null);
  assert.equal(extractLinkFilterUrl(""), null);
  assert.equal(extractLinkFilterUrl("not a url"), null);
  assert.equal(extractLinkFilterUrl(null), null);
});
