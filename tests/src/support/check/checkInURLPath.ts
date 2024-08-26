/**
 * Check if the given string is in the URL path
 * @param  {String}   falseCase       Whether to check if the given string is in
 *                                    the URL path or not
 * @param  {String}   expectedUrlPart The string to check for
 */
export default async (
  falseCase: boolean,
  expectedUrlPart: string
): Promise<void> => {
  /**
   * The URL of the current browser window
   * @type {String}
   */
  const currentUrl = await browser.getUrl();

  if (falseCase) {
    await expect(currentUrl).not.toContain(
      expectedUrlPart,
      // @ts-expect-error
      `Expected URL "${currentUrl}" not to contain ` + `"${expectedUrlPart}"`
    );
  } else {
    await expect(currentUrl).toContain(
      expectedUrlPart,
      // @ts-expect-error
      `Expected URL "${currentUrl}" to contain "${expectedUrlPart}"`
    );
  }
};
