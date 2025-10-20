import {fileURLToPath, pathToFileURL} from 'url';
import path from 'path';
import {app, BrowserWindow, ipcMain, shell} from 'electron';
import fs from 'fs';
import isDev from 'electron-is-dev';
import { config } from 'dotenv';
import pkg from 'electron-updater';
import firstTimeSetup, { installConnector } from './connectorInstaller.js';
import { uninstallConnector } from './connectorUninstaller.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

config();
const { autoUpdater } = pkg;

// Calculate __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


let mainWindow;
let splash;

const isTest = process.env.NODE_ENV === 'test'
if (process.env.NODE_ENV === 'test') {
    import('wdio-electron-service/main');
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        frame: false,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        splash = null
    });

    mainWindow.on('focus', () => {
      mainWindow.webContents.send('focus');
  });

    splash = new BrowserWindow({
        width: 1600,
        height: 900,
        frame: false,
        transparent: true,
      });
    
    const splashURL = isDev
      ? `file://${path.join(__dirname, './public/loading.html')}`
      : `file://${path.join(__dirname, './build/loading.html')}`;

    const startURL = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, './build/index.html')}`;

    try {
        await splash.loadURL(splashURL);
        await mainWindow.loadURL(startURL);
        mainWindow.show();
        splash.close();
        checkForDeferredUpdate();
    } catch (error) {
        console.log('CreateWindow error', error);
    }
}

function checkForDeferredUpdate() {
  const config = readUpdateConfig();
  if (config.updateOnNextLaunch) {
    autoUpdater.downloadUpdate();
    config.updateOnNextLaunch = false;
    writeUpdateConfig(config);
  }
}

function writeUpdateConfig(data) {
  const configFilePath = path.join(app.getPath('userData'), 'update-config.json');
  fs.writeFileSync(configFilePath, JSON.stringify(data));
}

function readUpdateConfig() {
  const configFilePath = path.join(app.getPath('userData'), 'update-config.json');
  if (!fs.existsSync(configFilePath)) return {};
  const data = fs.readFileSync(configFilePath, 'utf-8');
  return JSON.parse(data);
}

// Function to handle open URL
function handleOpenUrl(url) {
    console.log('Opened via custom protocol:', url);
    // Additional logic to handle the URL can be added here
}

app.on('ready', async () => {
    app.setAsDefaultProtocolClient('promptmixer');
    await createWindow();

    // macOS specific: handle open-url event
    app.on('open-url', (event, url) => {
        event.preventDefault();
        handleOpenUrl(url);
    });
    
    await firstTimeSetup();
    if (mainWindow) {
        mainWindow.webContents.send('setup-complete');
    }

    mainWindow.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (url !== mainWindow.webContents.getURL()) {
            event.preventDefault();
            shell.openExternal(url);
        }
    });
});

// Windows/Linux: handle second instance
app.on('second-instance', (event, commandLine) => {
    const url = commandLine.find(arg => arg.startsWith('promptmixer://'));
    if (url) handleOpenUrl(url);
});

async function checkMainJsExists(connectorsPath, folder) {
    try {
        const entryPath = await resolveConnectorEntryPath(folder, 'main.js', connectorsPath);
        await fs.promises.access(entryPath, fs.constants.F_OK);
        return true;
    } catch (error) {
        return false;
    }
}


async function getInstalledConnectors() {
    try {
        const connectorsPath = path.join(app.getPath('userData'), 'connectors');
        const folders = await fs.promises.readdir(connectorsPath);
        const installedConnectors = [];

        for (const folder of folders) {
            if (await checkMainJsExists(connectorsPath, folder)) {
                const configPath = await resolveConnectorEntryPath(folder, 'main.js', connectorsPath);
                delete require.cache[require.resolve(configPath)];
                const configFile = require(configPath);

                if (configFile) {
                    const manifestPath = path.join(connectorsPath, folder, 'manifest.json');
                    const versionTag = await getCurrentConnectorVersion(manifestPath);
                    const installedVersion =
                      versionTag ??
                      configFile?.config?.connectorVersion ??
                      configFile?.config?.version ??
                      undefined;

                    const connectorData = {
                      connectorFolder: folder,
                      ...configFile.config,
                      installedVersion,
                    };

                    if (!connectorData.connectorVersion && installedVersion) {
                      connectorData.connectorVersion = installedVersion;
                    }

                    installedConnectors.push(connectorData);
                }
            }
        }
        return installedConnectors;
    } catch (error) {
        console.error('Error getting installed connectors:', error);
        return [];
    }
}


async function readConnectorManifest(manifestPath) {
  try {
    const manifestRaw = await fs.promises.readFile(manifestPath, 'utf-8');
    const parsed = JSON.parse(manifestRaw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.error(`Failed to read connector manifest at ${manifestPath}:`, error);
    }
  }
  return null;
}

async function getCurrentConnectorVersion(manifestPath) {
  const manifest = await readConnectorManifest(manifestPath);
  return manifest?.versionTag ?? null;
}

async function resolveConnectorEntryPath(
  connectorFolder,
  entryPoint = 'main.js',
  connectorsRoot = path.join(app.getPath('userData'), 'connectors')
) {
  const connectorDir = path.join(connectorsRoot, connectorFolder);
  const manifestPath = path.join(connectorDir, 'manifest.json');
  const versionTag = await getCurrentConnectorVersion(manifestPath);

  if (versionTag) {
    return path.join(connectorDir, versionTag, entryPoint);
  }

  // Legacy layout fallback (pre-manifest connectors)
  return path.join(connectorDir, entryPoint);
}

async function loadConnectorModule(connectorFolder, entryPoint = 'main.js') {
  const connectorPath = await resolveConnectorEntryPath(connectorFolder, entryPoint);
  await fs.promises.access(connectorPath, fs.constants.R_OK);

  const moduleUrl = pathToFileURL(connectorPath);
  return await import(moduleUrl.href);
}

async function runConnector(connectorFolderPath, model, prompts, properties, settings) {
  try {
    const plugin = await loadConnectorModule(connectorFolderPath);
    if (plugin && typeof plugin.main === 'function') {
      // Call the main function of the connector script
      return await plugin.main(model, prompts, properties, settings);
    }
    throw new Error('Connector entry point missing exported main function');
  } catch (error) {
    console.error('Error running plugin:', error);
    return { Error: error, ModelType: model };
  }
}

ipcMain.on('request-installed-connectors', async (event, savedSettings) => {
  const installedConnectors = await getInstalledConnectors();
  try {
    let updatedConnectors = [];
    installedConnectors?.forEach((connector) => {
      const settingForConnector = savedSettings.find((savedSetting) => {
        return savedSetting.ConnectorFolder === connector.connectorFolder;
      });
        
      updatedConnectors.push(
        callGetDynamicModelList(connector, settingForConnector)
      );
    });

    try {
      const res = await Promise.all(updatedConnectors);
      event.reply('installed-connectors', res);
    } catch (error) {
      event.reply('installed-connectors', installedConnectors);
    }
  } catch (e) {
    console.log(e);
  }
});

ipcMain.on('run-connector-script', async (event, connector, prompts, properties, settings, outputId, workflow) => {
    try {
        const res = await runConnector(connector.ConnectorFolder, connector.Model, prompts, properties, settings);
        
        event.reply('connector-output', outputId, connector.Model, res, workflow);
    } catch (error) {
        // If fs.stat throws an error, the file does not exist or another error occurred
        console.error(`ConnectorPath error: ${error}`);
        event.reply('connector-output', outputId, connector.Model, { Error: error, ModelType: connector.Model }, workflow);
    }
});

ipcMain.on(
  'install-connector',
  async (event, connectorName, githubReleaseApiUrl) => {
    try {
      await installConnector(connectorName, githubReleaseApiUrl);

      event.reply('install-connector-success');
    } catch (error) {
      event.reply('install-connector-failed', error);
    }
  }
);

async function callGetDynamicModelList(connector, savedSettings) {
  function hasGetDynamicModelList(obj) {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      typeof obj.getDynamicModelList === 'function'
    );
  }

  try {
    const plugin = await loadConnectorModule(connector.connectorFolder);

    if (hasGetDynamicModelList(plugin)) {
        try {
          const models = await plugin.getDynamicModelList(
            savedSettings?.Settings ?? []
          );
          connector.models = models;
        } catch (error) {
          console.log("Can't call getDynamicModelList from connector:", error);
        }
    }

    return connector;
  } catch (e) {
    console.log(e);
  }
}

ipcMain.on('update-connector', async (event, connector, savedSettings) => {
  try {
    const updatedConnector = await callGetDynamicModelList(connector, { Settings: savedSettings} );

    console.log('test push');
    
    event.reply('update-connector-success', updatedConnector);
  } catch (error) {
    event.reply('update-connector-failed', error);
  }
});

ipcMain.on('remove-connector', async (event, connectorName) => {
    try {
        await uninstallConnector(connectorName)
        event.reply('remove-connector-success');
    } catch (error) {
        event.reply('remove-connector-failed', error);
    }
});

ipcMain.on('update-connector-version', async (event, connector, link) => {
  console.log('update-connector-version', connector, link);
  try {
    await installConnector(connector, link);
    event.reply('update-connector-version-success');
  } catch (error) {
    event.reply('update-connector-version-failed', error);
  }
  event.reply('update-connector-version-finish');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', async () => {
    if (mainWindow === null) {
        await createWindow();
    }
});

ipcMain.on('minimize-window', () => {
    mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow.maximize();
    }
});

ipcMain.on('close-window', () => {
    mainWindow.close();
});

ipcMain.on('open-url', (event, url) => {
    shell.openExternal(url);
});

ipcMain.on('get-app-version', (event) => {
  event.reply('app-version', app.getVersion());
});

ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('update-not-available');
});

ipcMain.on('install-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on('install-update-next-launch', (event) => {
  const config = readUpdateConfig();
  config.updateOnNextLaunch = true;
  writeUpdateConfig(config);
  event.reply('update-deferred');
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.webContents.send('download-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  const config = readUpdateConfig();
  if (!config.updateOnNextLaunch) {
    autoUpdater.quitAndInstall(false, true);
  }
});

autoUpdater.on('error', (error) => {
  mainWindow.webContents.send('update-error', error);
});
