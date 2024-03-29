import * as core from '@actions/core';
import { getClient } from './common';

export const post = async () => {
  try {
    const client = getClient(process.platform);

    const connected = !!core.getState('connected');
    if (connected) {
      await client.disconnect();
    }
    client.cleanup();
  } catch (err) {
    core.setFailed((err as Error).message);
  }
};

(async () => {
  await post();
})();
