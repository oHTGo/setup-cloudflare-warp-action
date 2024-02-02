import * as core from '@actions/core';
import { backOff } from 'exponential-backoff';
import LinuxClient from './lib/linux-client';
import { WARPClient } from './interfaces';

(async () => {
  const organization = core.getInput('organization', {
    required: true,
    trimWhitespace: true
  });
  const authClientID = core.getInput('auth-client-id', {
    required: true,
    trimWhitespace: true
  });
  const authClientSecret = core.getInput('auth-client-secret', {
    required: true,
    trimWhitespace: true
  });
  const version = core.getInput('version', {
    required: false,
    trimWhitespace: true
  });

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

  await client.writeConfigurations({
    organization,
    authClientID,
    authClientSecret
  });
  await client.install(version);
  await client.checkRegistration(organization, true);
  await backOff(() => client.checkRegistration(organization, true), {
    numOfAttempts: 20
  });
  await client.connect();
  await backOff(() => client.checkConnection(), { numOfAttempts: 20 });

  core.saveState('connected', 'true');
})();
