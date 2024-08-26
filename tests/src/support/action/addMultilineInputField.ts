import type { Selector } from 'webdriverio';
import checkIfElementExists from '../lib/checkIfElementExists.js';

/**
 * Set the value of the given input field to a new value, adding a value to the
 * current selector value, or simulate user input for multiline strings
 * @param  {String}   value   The value to set the selector to
 * @param  {String}   selector Element selector
 */
export default async (value: string, selector: Selector): Promise<void> => {
  let checkValue = value;

  await checkIfElementExists(selector, false, 1);

  if (!value) {
    checkValue = '';
  }

  const element = await $(selector);

  // Split the value by newlines to simulate multiline input
  const lines = checkValue.split('\\n');

  for (let i = 0; i < lines.length; i++) {
    // Add the current line's text
    await element.addValue(lines[i]);
    // If it's not the last line, send an Enter keypress to create a new line
    if (i < lines.length - 1) {
      await browser.keys('Enter');
    }
  }
};
