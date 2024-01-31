<p align="center">
  <img src="./assets/icon.png" alt="steamchat" width="25%">
</p>

<div align="center">
  <a href="https://github.com/bdeb1337/steamchat/actions/workflows/release.yml">
    <img src="https://github.com/bdeb1337/steamchat/actions/workflows/release.yml/badge.svg" alt="Release">
  </a>
  <a href="https://codeclimate.com/github/bdeb1337/steamchat/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/4f78b6c7abea3976b6ad/maintainability" />
  </a>
</div>

<h1 align="center">steamchat</h1>

Steamchat is an electron web wrapper for **Steam Chat** (https://steamcommunity.com/chat), designed primarily to replace the Steam Chat experience on macOS with the official Steam client, which I did not like. It is also available for Windows and Linux.

## features

- *steamchat* primarily operates from the system tray. You can access it by clicking the steamchat icon and selecting the **toggle window** button.
    - **Starts** in the system tray.
    - **Closes** to tray.
    - **Minimises** to tray.
- System notifications: steamchat integrates with your **system's native notifications**.
- **Update status**: You can update your status directly from the tray menu.
- **Simplified navigation**: Some navigation from the steamcommunity has been replaced, leaving only a **STEAM header logo** that returns you to the main chat dialog.


## installation

You can download the latest version of steamchat from the [Latest Release](https://github.com/bdeb1337/steamchat/releases/latest) page.

### macOS

1. Download the `steamchat-x.x.x.dmg` file from the [Latest Release](https://github.com/bdeb1337/steamchat/releases/latest) page.
2. Open the `steamchat-x.x.x.dmg` file and drag the steamchat app into your Applications folder.

### Linux

#### AppImage
1. Download the `steamchat_x.x.x.AppImage` file from the [Latest Release](https://github.com/bdeb1337/steamchat/releases/latest) page.
2. Make it executable by running `chmod +x steamchat_x.x.x.AppImage` in your terminal. You can then run the app by double-clicking the `steamchat_x.x.x.AppImage` file.

#### debian-based
1. Download the `steamchat_x.x.x_amd64.deb` file from the [Latest Release](https://github.com/bdeb1337/steamchat/releases/latest) page.
2. Install it by running `sudo dpkg -i steamchat_x.x.x_amd64.deb` in your terminal.

#### redhat-based
1. Download the `steamchat-x.x.x.x86-64.rpm` file from the [Latest Release](https://github.com/bdeb1337/steamchat/releases/latest) page.
2. Install it by running `sudo rpm -i steamchat-x.x.x.x86-64.rpm` in your terminal.

### Windows

#### Installer
1. Download the `steamchat-Setup-x.x.x.exe` file from the [Latest Release](https://github.com/bdeb1337/steamchat/releases/latest) page.
2. Run the `steamchat-Setup-x.x.x.exe` file. This will install steamchat and automatically add a shortcut to your desktop.

#### Portable
1. Download the `steamchat-x.x.x.exe` file from the [Latest Release](https://github.com/bdeb1337/steamchat/releases/latest) page.
2. Run the `steamchat-x.x.x.exe` file. This will start steamchat without installing it.

Remember to replace `x.x.x` with the version number you downloaded.

# contributing
Contributions are welcome! If you have a feature request, bug report, or want to improve the app, feel free to open an issue or submit a pull request.