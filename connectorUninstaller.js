import { promises as fs, existsSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

const connectorsPath = join(app.getPath('userData'), 'connectors');

export const uninstallConnector = async (connectorName) => {
  const connectorPath = join(connectorsPath, connectorName);
  if (!existsSync(connectorPath)) {
    return;
  }

  console.log(`Uninstalling connector: ${connectorName}`);
  try {
    await fs.rm(connectorPath, { recursive: true, force: true });
    console.log(`Connector ${connectorName} has been removed successfully.`);
  } catch (error) {
    console.error(`Error uninstalling connector ${error.message}`);
    throw error;
  }
}
