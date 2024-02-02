import * as core from '@actions/core';
import { backOff } from 'exponential-backoff';
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
    const organization = core.getInput('organization', { required: true });
    await backOff(async () => client.checkRegistration(organization, false));
    await client.disconnect();
  }
  client.cleanup();
})();
