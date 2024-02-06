import { getClient } from '../src/common';
import LinuxClient from '../src/libs/linux-client';
import MacClient from '../src/libs/mac-client';
import WinClient from '../src/libs/win-client';

describe('getClient', () => {
  it('should return a LinuxClient for linux platform', () => {
    const client = getClient('linux');
    expect(client).toBeInstanceOf(LinuxClient);
  });

  it('should return a MacClient for darwin platform', () => {
    const client = getClient('darwin');
    expect(client).toBeInstanceOf(MacClient);
  });

  it('should return a WinClient for win32 platform', () => {
    const client = getClient('win32');
    expect(client).toBeInstanceOf(WinClient);
  });

  it('should throw an error for unsupported platform', () => {
    expect(() => getClient('unsupported')).toThrow('Unsupported platform');
  });
});
