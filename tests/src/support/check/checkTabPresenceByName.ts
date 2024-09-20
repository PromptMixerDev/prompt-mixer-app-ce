/**
 * Check if a tab with a given name is present and visible.
 * @param {String} tabName The name of the tab to check.
 */
export default async (tabName: string): Promise<void> => {
  const tabSelector = `//div[contains(@class, 'flexlayout__tab_button')]//div[contains(text(), '${tabName}')]`;

  await browser.waitUntil(
    async () => {
      const tabs = await browser.$$(tabSelector);
      return tabs.length > 0 && (await tabs[0].isDisplayed());
    },
    {
      timeout: 5000, // Adjust the timeout as necessary
      timeoutMsg: `Expected ${tabName} tab to be visible within 5 seconds`,
    }
  );
};
