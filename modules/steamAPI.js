// Wrapper functions for Steam's internal API
const SteamAPI = {
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