/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */

const config = {
  appId: 'com.promptmixer.app',
  productName: 'PromptMixer',
  artifactName: 'PromptMixer-${version}.${arch}.${ext}',
  extraMetadata: { name: 'promptmixer', main: 'main.js' },
  asar: true,
  files: [
    'main.js',
    'preload.js',
    'connectorInstaller.js',
    'connectorUninstaller.js',
    'build/**/*',
  ],
  protocols: [
    {
      name: 'PromptMixer',
      schemes: ['promptmixer'],
      role: 'Editor',
    },
  ],
};

module.exports = config;
