import type { Selector } from 'webdriverio';

/**
 * Check the offset of the given element
 * @param  {String}   selector              Element selector
 * @param  {String}   falseCase         Whether to check if the offset matches
 *                                      or not
 * @param  {String}   expectedPosition  The position to check against
 * @param  {String}   axis              The axis to check on (x or y)
 */
export default async (
  selector: Selector,
  falseCase: boolean,
  expectedPosition: string,
  axis: 'x' | 'y'
): Promise<void> => {
  /**
   * Get the location of the element on the given axis
   * @type {[type]}
   */
  const location = await $(selector).getLocation(axis);

  /**
   * Parsed expected position
   * @type {Int}
   */
  const intExpectedPosition = parseFloat(expectedPosition);

  if (falseCase) {
    await expect(location).not.toEqual(
      intExpectedPosition,
      // @ts-expect-error
      `Element "${selector as string}" should not be positioned at ` +
        `${intExpectedPosition}px on the ${axis} axis`
    );
  } else {
    await expect(location).toEqual(
      intExpectedPosition,
      // @ts-expect-error
      `Element "${selector as string}" should be positioned at ` +
        `${intExpectedPosition}px on the ${axis} axis, but was found ` +
        `at ${location}px`
    );
  }
};
