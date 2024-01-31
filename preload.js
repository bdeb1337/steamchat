const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  function removeElementById(id) {
    const element = document.querySelector(`div[id="${id}"]`);
    if (element) element.remove();
  }
  
  function removeElementByClass(className) {
    const element = document.querySelector(`div[class="${className}"]`);
    if (element) element.remove();
  }
  
  function replaceLogoHref(selector) {
    const logo = document.querySelector(selector);
    if (logo) {
      const links = logo.querySelectorAll("a");
      links.forEach(function(link) {
        link.href = "https://steamcommunity.com/chat";
      });
    }
  }
  
  function handleMutation(mutation) {
    if (mutation.type === "childList") {
      // Remove the Steam Chat header
      removeElementByClass("main_SteamPageHeader_3NLSM");
  
      // Remove the Steam Community navigation bar
      // and replace with a link to the Steam Chat
      const idRemoveList = [
        "responsive_menu_logo",
        "store_controls",
        "store_nav_area",
        "global_actions"
      ];
      idRemoveList.forEach(removeElementById);
  
      // Remove the non-responsive Steam Community navigation bar
      const classRemoveList = ["supernav_container"];
      classRemoveList.forEach(removeElementByClass);
  
      // Replace the href in the logo
      replaceLogoHref(`div[class="logo"]`);
      replaceLogoHref(".responsive_header_logo");
    }
  }

  function handleMutations(mutations) {
    mutations.forEach(handleMutation);
  }

  const observer = new MutationObserver(handleMutations);

  // Start observing the document with the configured parameters
  observer.observe(document, { childList: true, subtree: true });

  // Forward web notifications to the main process
  const OldNotify = window.Notification;
  const newNotify = function (title, opt) {
    ipcRenderer.send("notify", { title, opt });
    return new OldNotify(title, opt);
  };
  newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify);
  window.Notification = newNotify;
});
