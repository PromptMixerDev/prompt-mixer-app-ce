import type { Selector } from 'webdriverio';

/**
 * Check if the given element is (not) visible
 * @param  {String}   selector   Element selector
 * @param  {String}   falseCase Check for a visible or a hidden element
 */
export default async (
  selector: Selector,
  falseCase: boolean
): Promise<void> => {
  /**
   * Visible state of the give element
   * @type {String}
   */
  const isDisplayed = await $(selector).isDisplayed();

  if (falseCase) {
    await expect(isDisplayed).not.toEqual(
      true,
      // @ts-expect-error
      `Expected element "${selector as string}" not to be displayed`
    );
  } else {
    await expect(isDisplayed).toEqual(
      true,
      // @ts-expect-error
      `Expected element "${selector as string}" to be displayed`
    );
  }
};
