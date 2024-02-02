import * as core from '@actions/core';
import { backOff } from 'exponential-backoff';
import LinuxClient from './libs/linux-client';
import MacClient from './libs/mac-client';
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
  const retryLimit = parseInt(
    core.getInput('retry-limit', {
      required: false,
      trimWhitespace: true
    })
  );

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

  await client.writeConfigurations({
    organization,
    authClientID,
    authClientSecret
  });
  await client.install(version);
  await backOff(async () => client.checkRegistration(organization), {
    numOfAttempts: retryLimit
  });
  await client.connect();
  await backOff(async () => client.checkConnection(), {
    numOfAttempts: retryLimit
  });

  core.saveState('connected', 'true');
})();
