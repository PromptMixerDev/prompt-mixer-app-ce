/**
 * Switches the iFrame
 * @param  {String}   selector iFrame element selector
 */
export default async (selector: string): Promise<void> => {
  /**
   * @type {String}
   */
  //
  // Get the iframe element
  const iframe = await $(selector);

  await browser.switchToFrame(iframe);
};
