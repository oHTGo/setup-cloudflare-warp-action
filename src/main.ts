import * as core from '@actions/core';
import { backOff } from 'exponential-backoff';
import { getClient } from './common';

(async () => {
  try {
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

    const client = getClient(process.platform);

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
  } catch (err) {
    core.setFailed((err as Error).message);
  }
})();
