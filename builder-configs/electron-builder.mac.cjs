const commonConfig = require('./electron-builder.common.cjs');

const config = {
  ...commonConfig,
  mac: {
    category: "public.app-category.developer-tools",
    icon: "resources/icons/icon.icns",
    target: [
      {
        target: 'dmg',
        arch: ['universal']
      },
      {
        target: 'dmg',
        arch: ['x64']
      },
      {
        target: 'dmg',
        arch: ['arm64']
      },
      {
        target: 'zip',
        arch: ['universal', 'x64', 'arm64']
      }
    ],
    type: 'distribution',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'resources/entitlements.mac.plist',
    entitlementsInherit: 'resources/entitlements.mac.plist',
    darkModeSupport: true
  },
  dmg: {
    sign: false
  },
  afterSign: 'scripts/notarize.js'
};

module.exports = config;
