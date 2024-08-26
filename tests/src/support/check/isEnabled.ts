import type { Selector } from 'webdriverio';

/**
 * Check if the given selector is enabled
 * @param  {String}   selector   Element selector
 * @param  {String}   falseCase Whether to check if the given selector
 *                              is enabled or not
 */
export default async (
  selector: Selector,
  falseCase: boolean
): Promise<void> => {
  /**
   * The enabled state of the given selector
   * @type {Boolean}
   */
  const isEnabled = await $(selector).isEnabled();

  if (falseCase) {
    await expect(isEnabled).not.toEqual(
      true,
      // @ts-expect-error
      `Expected element "${selector as string}" not to be enabled`
    );
  } else {
    await expect(isEnabled).toEqual(
      true,
      // @ts-expect-error
      `Expected element "${selector as string}" to be enabled`
    );
  }
};
