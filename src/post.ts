import * as core from '@actions/core';
import LinuxClient from './libs/linux-client';
import MacClient from './libs/mac-client';
import { WARPClient } from './interfaces';

(async () => {
  try {
    let client: WARPClient;
    switch (process.platform) {
      case 'linux': {
        client = new LinuxClient();
        break;
      }
      case 'darwin': {
        client = new MacClient();
        break;
      }
      default: {
        throw new Error('Unsupported platform');
      }
    }
    const connected = !!core.getState('connected');
    if (connected) {
      await client.disconnect();
    }
    client.cleanup();
  } catch (err) {
    core.setFailed((err as Error).message);
  }
})();
