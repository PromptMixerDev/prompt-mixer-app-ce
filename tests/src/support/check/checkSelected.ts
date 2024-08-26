import type { Selector } from 'webdriverio';

/**
 * Check the selected state of the given element
 * @param  {String}   selector   Element selector
 * @param  {String}   falseCase Whether to check if the element is elected or
 *                              not
 */
export default async (
  selector: Selector,
  falseCase: boolean
): Promise<void> => {
  /**
   * The selected state
   * @type {Boolean}
   */
  const isSelected = await $(selector).isSelected();

  if (falseCase) {
    await expect(isSelected)
      // @ts-expect-error
      .not.toEqual(true, `"${selector as string}" should not be selected`);
  } else {
    await expect(isSelected)
      // @ts-expect-error
      .toEqual(true, `"${selector as string}" should be selected`);
  }
};
