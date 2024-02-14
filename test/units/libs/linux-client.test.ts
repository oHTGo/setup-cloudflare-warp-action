import * as exec from '@actions/exec';
import * as fs from 'fs/promises';
import * as tc from '@actions/tool-cache';
import LinuxClient from '../../../src/libs/linux-client';

jest.mock('@actions/exec');
jest.mock('fs/promises');
jest.mock('@actions/tool-cache');

describe('LinuxClient', () => {
  let client: LinuxClient;

  beforeEach(() => {
    client = new LinuxClient();
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
      'sudo mkdir -p /var/lib/cloudflare-warp/'
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      '/tmp/mdm.xml',
      expect.any(String)
    );
    expect(mockExec).toHaveBeenCalledWith(
      'sudo mv /tmp/mdm.xml /var/lib/cloudflare-warp/'
    );
  });

  it('should install', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;
    const mockDownloadTool = tc.downloadTool as jest.MockedFunction<
      typeof tc.downloadTool
    >;

    mockDownloadTool.mockResolvedValue('/path/to/gpgKey');

    await client.install();

    expect(mockDownloadTool).toHaveBeenCalledWith(
      'https://pkg.cloudflareclient.com/pubkey.gpg'
    );
    expect(mockExec).toHaveBeenCalledWith(
      `/bin/bash -c "cat /path/to/gpgKey | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg"`
    );
    expect(mockExec).toHaveBeenCalledWith(
      `/bin/bash -c "echo \\"deb [arch=amd64 signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main\\" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list"`
    );
    expect(mockExec).toHaveBeenCalledWith('sudo apt update');
    expect(mockExec).toHaveBeenCalledWith(
      'sudo apt install -y cloudflare-warp'
    );
  });

  it('should install with version', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;
    const mockDownloadTool = tc.downloadTool as jest.MockedFunction<
      typeof tc.downloadTool
    >;

    mockDownloadTool.mockResolvedValue('/path/to/gpgKey');

    await client.install('1.0.0');

    expect(mockDownloadTool).toHaveBeenCalledWith(
      'https://pkg.cloudflareclient.com/pubkey.gpg'
    );
    expect(mockExec).toHaveBeenCalledWith(
      `/bin/bash -c "cat /path/to/gpgKey | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg"`
    );
    expect(mockExec).toHaveBeenCalledWith(
      `/bin/bash -c "echo \\"deb [arch=amd64 signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main\\" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list"`
    );
    expect(mockExec).toHaveBeenCalledWith('sudo apt update');
    expect(mockExec).toHaveBeenCalledWith(
      'sudo apt install -y cloudflare-warp=1.0.0'
    );
  });

  it('should cleanup', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    await client.cleanup();

    expect(mockExec).toHaveBeenCalledWith(
      'sudo rm -f /var/lib/cloudflare-warp/mdm.xml'
    );
  });
});
