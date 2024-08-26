import type { Selector } from 'webdriverio';

/**
 * Check how many child elements matching a given selector exist in the container.
 * @param  {String}   expectedCount The expected number of elements matching a given selector.
 * @param  {String}   selector  Element selector
 * @param  {String}   containerSelector  Container selector


 */
export default async (
  expectedCount: string,
  selector: Selector,
  containerSelector: Selector
): Promise<void> => {
  /**
   * Elements found in the DOM
   * @type {Object}
   */
  const containerElement = await $(containerSelector);

  const childElements = await containerElement.$$(selector);

  const actualCount = childElements.length;

  const intExpectedCount = parseInt(expectedCount, 10);
  if (actualCount !== intExpectedCount) {
    throw new Error(
      `Expected ${expectedCount} child elements matching selector "${selector as string}", but found ${actualCount}.`
    );
  }
};
