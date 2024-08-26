/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Selector } from 'webdriverio';

/**
 * Check if the given element exists in the DOM one or more times
 * @param  {String}  selector  Element selector
 * @param  {Boolean} falseCase Check if the element (does not) exists
 * @param  {Number}  exactly   Check if the element exists exactly this number
 *                             of times
 */
export default async (
  selector: Selector,
  falseCase?: boolean,
  exactly?: string | number
): Promise<void> => {
  /**
   * The number of elements found in the DOM
   * @type {Int}
   */
  const nrOfElements = await $$(selector);

  if (falseCase === true) {
    await expect(nrOfElements).toHaveLength(
      0,
      // @ts-expect-error
      `Element with selector "${selector as string}" should not exist on the page`
    );
  } else if (exactly) {
    await expect(nrOfElements).toHaveLength(
      +exactly,
      // @ts-expect-error
      `Element with selector "${selector as string}" should exist exactly ${exactly} time(s)`
    );
  } else {
    await expect(nrOfElements.length).toBeGreaterThanOrEqual(
      1,
      // @ts-expect-error
      `Element with selector "${selector as string}" should exist on the page`
    );
  }
};
