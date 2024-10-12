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

Steamchat is an electron web wrapper for **Steam Chat** (https://steamcommunity.com/chat), designed primarily to replace the Steam Chat experience on macOS with the official Steam client. It is also available for Windows and Linux.

## features

- **steamchat** primarily operates from the system tray. You can access it by clicking the steamchat icon and selecting the **toggle window** button.
- **Configurable application behaviour** by right clicking the tray icon and selecting **settings**.
  - **Minimize on Close** - Minimize the application to the system tray when the close button isclicked.
  - **Minimize to Tray** - Minimize the application to the system tray when the minimize button isclicked.
  - **Start Minimized** - Start the application minimized to the system tray.
  - **Launch on Startup** - Start the application when the system starts.
- **System notifications**: steamchat integrates with your **system's native notifications**.
- **Update status**: You can update your status directly from the tray menu.
- **Simplified navigation**: Some navigation from the steamcommunity has been replaced, leaving only a **STEAM header logo** that returns you to the main chat dialog.
- **Automatic reconnection**: steamchat will automatically reconnect if you lose your connection.

## installation

### Manually

You can download the latest version of steamchat from the [releases](https://github.com/bdeb1337/steamchat/releases/latest) page and install it manually.

### macOS

#### Homebrew

```shell
brew tap bdeb1337/bdeb1337
brew install --cask steamchat
```

Since code signing is not yet implemented but needed for notifications/audio you will need to self-sign the app:

```shell
# generate a self-signed certificate cref. 
# https://www.simplified.guide/macos/keychain-cert-code-signing-create 
# and https://support.apple.com/guide/keychain-access/create-self-signed-certificates-kyca8916/mac
codesign --deep --force --verify --verbose --sign "Your Certificate" /Applications/steamchat.app
```

### Windows

#### scoop

```shell
scoop bucket add bdeb-bucket https://github.com/bdeb1337/bdeb-bucket
scoop install steamchat
```

# contributing

Contributions are welcome! If you have a feature request, bug report, or want to improve the app, feel free to open an issue or submit a pull request.
