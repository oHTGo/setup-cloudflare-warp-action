import LinuxClient from './libs/linux-client';
import MacClient from './libs/mac-client';
import { WARPClient } from './interfaces';

export const getClient = (platform: string): WARPClient => {
  switch (platform) {
    case 'linux': {
      return new LinuxClient();
    }
    case 'darwin': {
      return new MacClient();
    }
    default: {
      throw new Error('Unsupported platform');
    }
  }
};
