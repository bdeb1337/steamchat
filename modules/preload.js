// Import ipcRenderer from Electron
const { ipcRenderer } = require("electron");

// Add an event listener for the DOMContentLoaded event
window.addEventListener("DOMContentLoaded", () => {
  // Function to replace the text of an element
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  // Replace the text of the version elements
  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  // Function to remove an element
  function removeElement(selector) {
    const element = document.querySelector(selector);
    if (element) element.remove();
  }

  // Function to replace the href of the logo links
  function replaceLogoHref(selector) {
    const logo = document.querySelector(selector);
    if (logo) {
      const links = logo.querySelectorAll("a");
      links.forEach(function(link) {
        link.href = "https://steamcommunity.com/chat";
      });
    }
  }

  // Function to handle a mutation
  function handleMutation(mutation) {
    if (mutation.type === "childList") {
      // Remove the Steam Chat header
      removeElement(`div[class="main_SteamPageHeader_3NLSM"]`);

      // Remove the Steam Community navigation bar
      // and replace with a link to the Steam Chat
      const idRemoveList = [
        "responsive_menu_logo",
        "store_controls",
        "store_nav_area",
        "global_actions"
      ];
      idRemoveList.forEach(id => removeElement(`div[id="${id}"]`));

      // Remove the non-responsive Steam Community navigation bar
      const classRemoveList = ["supernav_container"];
      classRemoveList.forEach(className => removeElement(`div[class="${className}"]`));

      // Replace the href in the logo
      replaceLogoHref(`div[class="logo"]`);
      replaceLogoHref(".responsive_header_logo");
    }
  }

  // Function to handle multiple mutations
  function handleMutations(mutations) {
    mutations.forEach(handleMutation);
  }

  // Create a new MutationObserver
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