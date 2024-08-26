/**
 * Open the Electron application
 */

// import { browser } from '@wdio/globals';

export default async (): Promise<void> => {
  // Navigate to the Electron application
  // await browser.url('promptmixer://.');
  await browser.pause(5000);

  // You can add additional commands here if needed, for example,
  // to wait for a specific element to ensure the app has loaded
  // await browser.waitForExist('your-selector');

  // Example of getting application metadata
  const appName = await browser.getTitle();
  // const appVersion = await browser.electron.app('getVersion');

  console.log(`Electron App Name: ${appName}`);
  // console.log(`Electron App Version: ${appVersion}`);
};
