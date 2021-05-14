import { app, BrowserWindow, dialog } from "electron";
import { autoUpdater } from "electron-updater"
import "../renderer/store";

let response = null;

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

//app.setAsDefaultProtocolClient("swlauncher"); // so that we can handle swlauncher://${ip}:${port} in the future for simplyfied launching

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
  });

  mainWindow.loadURL(winURL);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", () => {
  autoUpdater.checkForUpdatesAndNotify();
  var updateInterval = setInterval(function() {
    if (!response) {
      autoUpdater.checkForUpdatesAndNotify();
    } else clearInterval(updateInterval)
  }, 300000);
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "question",
    buttons: ["Restart", "Not Now. Later"],
    defaultId: 0,
    title: "Soulworker Launcher Update",
    message:
      "A Newer Version has been Published.\n Please Restart the Application to Apply it.",
  };
  response = dialog.showMessageBox(null, dialogOpts);
  if (response === 0) autoUpdater.quitAndInstall();
  autoUpdater.autoInstallOnAppQuit = true;
});
