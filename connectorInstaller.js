import { promises as fs, existsSync, mkdirSync, rmSync, renameSync, readdirSync } from 'fs';
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
  const connectorBasePath = join(connectorsPath, connectorName);
  if (!existsSync(connectorBasePath)) {
    mkdirSync(connectorBasePath, { recursive: true });
  }

  console.log(`Installing connector: ${connectorName}`);

  try {
    const releaseBuffer = await fetchUrl(githubReleaseApiUrl);
    const releaseData = JSON.parse(releaseBuffer.toString());
    const assetFiles = releaseData.assets.filter(
      (asset) => !asset.name.endsWith('.zip') && !asset.name.endsWith('.tar.gz')
    );

    if (!assetFiles.length) {
      throw new Error('No distributable assets found for connector release');
    }

    const versionTag = releaseData.tag_name ?? `build-${Date.now()}`;
    const stagingDir = join(connectorBasePath, `.tmp-${versionTag}`);

    if (existsSync(stagingDir)) {
      rmSync(stagingDir, { recursive: true, force: true });
    }
    mkdirSync(stagingDir, { recursive: true });

    for (const asset of assetFiles) {
      const assetBuffer = await fetchUrl(asset.browser_download_url);
      const assetPath = join(stagingDir, asset.name);
      console.log(`Downloading asset: ${asset.name}`);
      await fs.writeFile(assetPath, assetBuffer);
    }

    const versionedDir = join(connectorBasePath, versionTag);
    if (existsSync(versionedDir)) {
      rmSync(versionedDir, { recursive: true, force: true });
    }

    renameSync(stagingDir, versionedDir);

    const manifestPath = join(connectorBasePath, 'manifest.json');
    await fs.writeFile(
      manifestPath,
      JSON.stringify(
        {
          versionTag,
          updatedAt: new Date().toISOString(),
          assets: assetFiles.map((asset) => asset.name),
        },
        null,
        2
      ),
      'utf-8'
    );

    const entries = readdirSync(connectorBasePath, { withFileTypes: true });
    entries.forEach((entry) => {
      const dirPath = join(connectorBasePath, entry.name);
      if (entry.isDirectory() && entry.name !== versionTag && entry.name !== '.tmp') {
        rmSync(dirPath, { recursive: true, force: true });
      }
    });

    console.log(`${connectorName} has been installed successfully to ${versionedDir}.`);
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
