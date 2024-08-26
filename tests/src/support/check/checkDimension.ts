import type { Selector } from 'webdriverio';
import type { RectReturn } from '@wdio/protocols';

/**
 * Check the dimensions of the given element
 * @param  {String}   selector         Element selector
 * @param  {String}   falseCase    Whether to check if the dimensions match or
 *                                 not
 * @param  {String}   expectedSize Expected size
 * @param  {String}   dimension    Dimension to check (broad or tall)
 */
export default async (
  selector: Selector,
  falseCase: boolean,
  expectedSize: string,
  dimension: 'broad' | 'tall'
): Promise<void> => {
  /**
   * The size of the given element
   * @type {Object}
   */
  // @ts-expect-error
  const elementSize = (await $(selector).getSize()) as RectReturn;

  /**
   * Parsed size to check for
   * @type {Int}
   */
  const intExpectedSize = parseInt(expectedSize, 10);

  /**
   * The size property to check against
   * @type {Int}
   */
  let originalSize = elementSize.height;

  /**
   * The label of the checked property
   * @type {String}
   */
  let label = 'height';

  if (dimension === 'broad') {
    originalSize = elementSize.width;
    label = 'width';
  }

  if (falseCase) {
    await expect(originalSize).not.toBe(
      intExpectedSize,
      // @ts-expect-error
      `Element "${selector as string}" should not have a ${label} of ` +
        `${intExpectedSize}px`
    );
  } else {
    await expect(originalSize).toBe(
      intExpectedSize,
      // @ts-expect-error
      `Element "${selector as string}" should have a ${label} of ` +
        `${intExpectedSize}px, but is ${originalSize}px`
    );
  }
};
