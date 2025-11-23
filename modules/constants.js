// Steam persona state codes
// See: https://partner.steamgames.com/doc/api/ISteamFriends#EPersonaState
const PERSONA_STATE = {
  OFFLINE: 0,
  ONLINE: 1,
  BUSY: 2,      // Not currently used
  AWAY: 3,
  SNOOZE: 4,    // Not currently used
  LOOKING_TO_TRADE: 5,  // Not currently used
  LOOKING_TO_PLAY: 6,   // Not currently used
  INVISIBLE: 7,
};

// Update intervals in milliseconds
const INTERVALS = {
  MENU_UPDATE: 1000,      // How often to check for status changes
  CONNECTION_CHECK: 5000, // How often to verify Steam connection
  TOOLTIP_UPDATE: 10000,  // How often to update tray tooltip
};

// Steam chat URL
const STEAM_CHAT_URL = "https://steamcommunity.com/chat";

module.exports = {
  PERSONA_STATE,
  INTERVALS,
  STEAM_CHAT_URL,
};