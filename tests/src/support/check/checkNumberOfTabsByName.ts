/**
 * Check how many tabs with a given name are open.
 * @param {String} expectedCount The expected number of tabs with the given name.
 * @param {String} tabName The name of the tab to check.
 */
export default async (
  expectedCount: string,
  tabName: string
): Promise<void> => {
  const tabSelector = `//div[contains(@class, 'flexlayout__tab_button')]//div[contains(text(), '${tabName}')]`;

  const tabs = await browser.$$(tabSelector);
  const actualCount = tabs.length;

  const intExpectedCount = parseInt(expectedCount, 10);
  if (actualCount !== intExpectedCount) {
    throw new Error(
      `Expected ${expectedCount} tabs with name "${tabName}", but found ${actualCount}.`
    );
  }
};
