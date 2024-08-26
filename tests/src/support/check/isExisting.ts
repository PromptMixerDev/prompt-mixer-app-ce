import type { Selector } from 'webdriverio';

/**
 * Check if the given element exists in the current DOM
 * @param  {String}   selector  Element selector
 * @param  {String}   falseCase Whether to check if the element exists or not
 */
export default async (
  selector: Selector,
  falseCase: boolean
): Promise<void> => {
  /**
   * Elements found in the DOM
   * @type {Object}
   */
  const elements = await $$(selector);

  if (falseCase) {
    await expect(elements).toHaveLength(
      0,
      // @ts-expect-error
      `Expected element "${selector as string}" not to exist`
    );
  } else {
    await expect(elements.length).toBeGreaterThan(
      0,
      // @ts-expect-error
      `Expected element "${selector as string}" to exist`
    );
  }
};
