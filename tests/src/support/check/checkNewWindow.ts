/**
 * Check if a new window or tab is opened
 * @param  {String}   obsolete  The type of opened object (window or tab)
 * @param  {String}   falseCase Whether to check if a new window/tab was opened
 *                              or not
 */
export default async (obsolete: never, falseCase: boolean): Promise<void> => {
  /**
   * The handles of all open windows/tabs
   * @type {Object}
   */
  const windowHandles = await browser.getWindowHandles();

  if (falseCase) {
    await expect(windowHandles).toHaveLength(
      1,
      // @ts-expect-error
      'A new window should not have been opened'
    );
  } else {
    await expect(windowHandles).not.toHaveLength(
      1,
      // @ts-expect-error
      'A new window has been opened'
    );
  }
};
