const commonConfig = require('./electron-builder.common.cjs');

const config = {
  ...commonConfig,
  win: {
    target: 'nsis',
    icon: 'resources/icons/icon.ico',
    publisherName: 'Prompt Mixer LLC',
    artifactName: 'PromptMixer.${version}.${ext}'
  },
};

module.exports = config;