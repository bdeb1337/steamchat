const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  // Create a new MutationObserver instance
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        // Remove the Steam Chat header
        const chatHeader = document.querySelector(
          ".main_SteamPageHeader_3NLSM"
        );
        if (chatHeader) chatHeader.remove();
  
        // Remove the Steam Community navigation bar
        // and replace with a link to the Steam Chat
        const idRemoveList = [
            "responsive_menu_logo",
            "store_controls",
            "store_nav_area",
            "global_actions"
        ];
        // Iterate over the idRemoveList array and remove the elements
        idRemoveList.forEach(function(id) {
            const element = document.querySelector(`div[id="${id}"]`);
            if (element) element.remove();
        });

        // Remove the non-responsive Steam Community navigation bar
        const classRemoveList = [
            "supernav_container"
        ];
        // Iterate over the classRemoveList array and remove the elements
        classRemoveList.forEach(function(className) {
            const element = document.querySelector(`div[class="${className}"]`);
            if (element) element.remove();
        });

        // Search for the class logo
        // in non-responsive mode, the logo is in a different location
        const headerLogo = document.querySelector(`div[class="logo"]`);
        // if the logo is found, replace the href in any child <a> to the Steam Chat
        if (headerLogo) {
            const links = headerLogo.querySelectorAll("a");
            links.forEach(function(link) {
                link.href = "https://steamcommunity.com/chat";
            });
        }
        // in responsive mode, the logo is in a different location
        const responsiveHeaderLogo = document.querySelector(".responsive_header_logo");
        // if the logo is found, replace the href in any child <a> to the Steam Chat
        if (responsiveHeaderLogo) {
            const links = responsiveHeaderLogo.querySelectorAll("a");
            links.forEach(function(link) {
                link.href = "https://steamcommunity.com/chat";
            });
        }
      }
    });
  });

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
