import * as exec from '@actions/exec';
import * as fs from 'fs/promises';
import MacClient from '../../src/libs/mac-client';

jest.mock('@actions/exec');
jest.mock('fs/promises');

describe('MacClient', () => {
  let client: MacClient;

  beforeEach(() => {
    client = new MacClient();
  });

  it('should write configurations', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;
    const mockWriteFile = fs.writeFile as jest.MockedFunction<
      typeof fs.writeFile
    >;

    const params = {
      organization: 'testOrg',
      authClientID: 'testID',
      authClientSecret: 'testSecret'
    };

    await client.writeConfigurations(params);

    expect(mockExec).toHaveBeenCalledWith(
      `sudo mkdir -p "/Library/Managed Preferences/"`
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      '/tmp/com.cloudflare.warp.plist',
      expect.any(String)
    );
    expect(mockExec).toHaveBeenCalledWith(
      'plutil -convert binary1 /tmp/com.cloudflare.warp.plist'
    );
    expect(mockExec).toHaveBeenCalledWith(
      'sudo mv /tmp/com.cloudflare.warp.plist "/Library/Managed Preferences/"'
    );
  });

  it('should install', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    await client.install();

    expect(mockExec).toHaveBeenCalledWith(
      'brew install --cask cloudflare-warp'
    );
  });

  it('should install with version', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    await client.install('1.0.0');

    expect(mockExec).toHaveBeenCalledWith(
      'brew install --cask cloudflare-warp@1.0.0'
    );
  });

  it('should cleanup', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    await client.cleanup();

    expect(mockExec).toHaveBeenCalledWith(
      'sudo rm -f "/Library/Managed Preferences/com.cloudflare.warp.plist"'
    );
  });
});
