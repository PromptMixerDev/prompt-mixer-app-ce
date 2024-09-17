/**
 * Close a tab with a given name.
 * @param {String} tabName The name of the tab to close.
 */
export default async (tabName: string): Promise<void> => {
  // Selector for the tab with the given name
  const tabSelector = `//div[contains(@class, 'flexlayout__tab_button')]//div[contains(text(), '${tabName}')]`;
  // Find the tab
  const tab = await browser.$(tabSelector);
  if (!tab) {
    throw new Error(`Tab with name "${tabName}" not found.`);
  }

  // Revised selector for the close button specific to this tab
  const closeButtonSelector = `./parent::*/following-sibling::div[@data-layout-path[contains(., '/button/close')]]`;

  // Find the close button within this tab
  const closeButton = await tab.$(closeButtonSelector);
  if (!closeButton) {
    throw new Error(`Close button not found for tab "${tabName}".`);
  }

  // Click the close button
  await closeButton.click();
};
