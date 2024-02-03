import LinuxClient from './libs/linux-client';
import MacClient from './libs/mac-client';
import WinClient from './libs/win-client';
import { WARPClient } from './interfaces';

export const getClient = (platform: string): WARPClient => {
  switch (platform) {
    case 'linux': {
      return new LinuxClient();
    }
    case 'darwin': {
      return new MacClient();
    }
    case 'win32': {
      return new WinClient();
    }
    default: {
      throw new Error('Unsupported platform');
    }
  }
};
