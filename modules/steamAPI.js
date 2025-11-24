/**
 * Steam API wrapper for executing JavaScript in the Steam chat window
 * Provides methods to interact with Steam's internal g_FriendsUIApp object
 */
const SteamAPI = {
  /**
   * Internal health check - verifies Steam API is available
   * @private
   */
  _healthCheck: () => `
    (function() {
      if (!window.g_FriendsUIApp) return 'g_FriendsUIApp missing';
      if (!window.g_FriendsUIApp.FriendStore) return 'FriendStore missing';
      if (!window.g_FriendsUIApp.m_UserStore) return 'UserStore missing';
      if (!window.g_FriendsUIApp.m_CMInterface) return 'CMInterface missing';
      return true;
    })();
  `,

  /**
   * Executes JavaScript in the window with automatic health check
   * @param {BrowserWindow} win - The browser window
   * @param {string} jsCode - JavaScript code to execute
   * @returns {Promise<any>} Result of the JavaScript execution, or null on error
   */
  async execute(win, jsCode) {
    try {
      // First check if Steam API is available
      const healthCheck = await win.webContents.executeJavaScript(this._healthCheck());
      if (healthCheck !== true) {
        console.error('Steam API health check failed:', healthCheck);
        return null;
      }
      
      // Execute the actual code
      return await win.webContents.executeJavaScript(jsCode);
    } catch (error) {
      console.error('Failed to execute Steam API call:', error);
      return null;
    }
  },

  // API method strings
  setPersonaState: (statusCode) => 
    `g_FriendsUIApp.FriendStore.SetUserPersonaState(${statusCode});`,
  
  getPersonaState: () => 
    `g_FriendsUIApp.FriendStore.m_eUserPersonaState;`,
  
  getPersonaName: () => 
    `g_FriendsUIApp.m_UserStore.m_CMInterface.persona_name;`,
  
  isConnected: () => 
    `g_FriendsUIApp.m_CMInterface.m_bConnected;`,
};

module.exports = SteamAPI;