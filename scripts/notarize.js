import { config } from 'dotenv';
import { notarize } from 'electron-notarize';

config();

async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    tool: 'notarytool',
    appBundleId: 'com.promptmixer.app',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.TEAMID,
    ascProvider: process.env.ASCPROVIDER,
  });
};

export default notarizing;
