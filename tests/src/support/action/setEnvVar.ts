import type { Selector } from 'webdriverio';

/**
 * Set the environment variable value of the given input field
 * @param  {String}   envVarName   The name of environment variable
 * @param  {String}   selector Element selector
 */
export default async (
  envVarName: string,
  selector: Selector
): Promise<void> => {
  const envVar = process.env[envVarName] ?? '';
  await $(selector)['setValue'](envVar);
};
