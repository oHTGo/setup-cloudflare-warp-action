import * as exec from '@actions/exec';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as core from '@actions/core';
import WinClient from '../../src/libs/win-client';

jest.mock('@actions/exec');
jest.mock('fs/promises');
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    existsSync: jest.fn()
  };
});
jest.mock('@actions/core');

describe('WinClient', () => {
  let client: WinClient;

  beforeEach(() => {
    jest.resetAllMocks();
    client = new WinClient();
  });

  it('should write configurations', async () => {
    const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    const mockWriteFile = fs.writeFile as jest.MockedFunction<
      typeof fs.writeFile
    >;
    const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;
    mockExistsSync.mockReturnValue(false);

    const params = {
      organization: 'testOrg',
      authClientID: 'testID',
      authClientSecret: 'testSecret'
    };

    await client.writeConfigurations(params);

    expect(mockMkdir).toHaveBeenCalledWith('C:\\ProgramData\\Cloudflare');
    expect(mockWriteFile).toHaveBeenCalledWith(
      'C:\\ProgramData\\Cloudflare\\mdm.xml',
      expect.any(String)
    );
  });

  it('should install', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;
    const mockAddPath = core.addPath as jest.MockedFunction<
      typeof core.addPath
    >;

    await client.install('1.0.0');

    expect(mockExec).toHaveBeenCalledWith(
      'choco install -y warp --version=1.0.0'
    );
    expect(mockAddPath).toHaveBeenCalledWith(
      'C:\\Program Files\\Cloudflare\\Cloudflare WARP\\'
    );
  });

  it('should install without version', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;
    const mockAddPath = core.addPath as jest.MockedFunction<
      typeof core.addPath
    >;

    await client.install();

    expect(mockExec).toHaveBeenCalledWith('choco install -y warp');
    expect(mockAddPath).toHaveBeenCalledWith(
      'C:\\Program Files\\Cloudflare\\Cloudflare WARP\\'
    );
  });

  it('should cleanup', async () => {
    const mockRm = fs.rm as jest.MockedFunction<typeof fs.rm>;

    await client.cleanup();

    expect(mockRm).toHaveBeenCalledWith(
      'C:\\ProgramData\\Cloudflare\\mdm.xml',
      { force: true }
    );
  });
});
