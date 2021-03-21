const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const { Client, Authenticator } = require("minecraft-launcher-core");
const launcher = new Client();

let mainWindow;
let child;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Hassium",
    icon: path.join(__dirname, "/asset/logo.ico"),
    width: 1280,
    height: 720,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadURL(path.join(__dirname, "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on('login',(evt,data)=>{
  Authenticator.getAuth(data.user, data.pass)
    .then((user) => {
      let opts = {
        clientPackage: "https://b5e592a184e4.ngrok.io/hassium/assets/modpacks.zip",
        authorization: Authenticator.getAuth(data.user, data.pass),
        root: "./.hassium",
        version: {
            number: "1.16.5",
            type: "release"
        },
        forge: "./.hassium/forge.jar",
        memory: {
            max: "6G",
            min: "1G"
        }
      }
      mainWindow.loadURL(path.join(__dirname, 'app.html')).then(() => {
        mainWindow.webContents.send('user', user);
      });

      launcher.launch(opts);

      launcher.on('debug', (e) => console.log(e));
      launcher.on('data', (e) => console.log(e));
      launcher.on('progress', (e) => console.log(e));
    })
  .catch(() => {
  evt.sender.send('err', 'Mauvais identifiants');
 });
});