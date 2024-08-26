import { promises as fs, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { app, net } from 'electron';

const configPath = join(app.getPath('userData'), 'appConfig.json');
const connectorsPath = join(app.getPath('userData'), 'connectors');

if (!existsSync(connectorsPath)) {
  mkdirSync(connectorsPath, { recursive: true });
}

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    request.on('response', (response) => {
      const chunks = [];
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    });
    request.on('error', (error) => {
      reject(error);
    });
    request.end();
  });
}

export async function installConnector(connectorName, githubReleaseApiUrl) {
  const connectorPath = join(connectorsPath, connectorName);
  if (!existsSync(connectorPath)) {
    mkdirSync(connectorPath, { recursive: true });
  }

  console.log(`Installing connector: ${connectorName}`);

  try {
    // Fetch the latest release data from GitHub API
    const releaseBuffer = await fetchUrl(githubReleaseApiUrl);
    const releaseData = JSON.parse(releaseBuffer.toString());

    // Filter out source code archives
    const assetFiles = releaseData.assets.filter(asset => !asset.name.endsWith('.zip') && !asset.name.endsWith('.tar.gz'));

    // Download each asset file
    for (const asset of assetFiles) {
      const assetPath = join(connectorPath, asset.name);
      console.log(`Downloading asset: ${asset.name}`);

      const assetBuffer = await fetchUrl(asset.browser_download_url);

      await fs.writeFile(assetPath, assetBuffer);
      console.log(`${asset.name} has been saved successfully.`);
    }

    console.log(`${connectorName} has been installed successfully.`);
  } catch (error) {
    console.error(`Failed to install ${connectorName}:`, error);
    throw error;
  }
}

async function readConfig() {
  if (existsSync(configPath)) {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  }
  return {};
}

async function writeConfig(config) {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

async function firstTimeSetup() {
  try {
    let config = await readConfig();
    if (!config.firstRunComplete) {
      console.log('Running first-time setup...');
  
      const connectorsToInstall = [
        {
          name: 'prompt-mixer-open-ai-connector',
          api_url: 'https://api.github.com/repos/PromptMixerDev/prompt-mixer-open-ai-connector/releases/latest',
        },
        {
          name: 'prompt-mixer-anthropic-ai-connector',
          api_url: 'https://api.github.com/repos/PromptMixerDev/prompt-mixer-anthropic-ai-connector/releases/latest',
        },
      ];
  
      for (const connector of connectorsToInstall) {
        try {
          await installConnector(connector.name, connector.api_url);
        } catch (error) {
          console.error(`Failed to install connector ${connector.name} error: ${error}`);
        }
      }
  
      config.firstRunComplete = true;
      await writeConfig(config);
  
      console.log('First-time setup completed.');
    } else {
      console.log('First-time setup already completed. Skipping...');
    }
  } catch (error) {
    console.error(`First-time setup error: ${error}`);
  }
}

export default firstTimeSetup;
