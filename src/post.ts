import * as core from '@actions/core';
import LinuxClient from './lib/linux-client';
import { WARPClient } from './interfaces';

(async () => {
  let client: WARPClient;
  switch (process.platform) {
    case 'linux': {
      client = new LinuxClient();
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
})();
