import * as exec from '@actions/exec';
import BaseClient from '../../../src/libs/base-client';

jest.mock('@actions/exec');

class TestClient extends BaseClient {
  async writeConfigurations() {
    return Promise.resolve();
  }
  async install() {
    return Promise.resolve();
  }
  async cleanup() {
    return Promise.resolve();
  }
}

describe('BaseClient', () => {
  let client: TestClient;

  beforeEach(() => {
    client = new TestClient();
  });

  it('should connect', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    await client.connect();

    expect(mockExec).toHaveBeenCalledWith('warp-cli', [
      '--accept-tos',
      'connect'
    ]);
  });

  it('should disconnect', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    await client.disconnect();

    expect(mockExec).toHaveBeenCalledWith('warp-cli', [
      '--accept-tos',
      'disconnect'
    ]);
  });

  it('should check registration', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    mockExec.mockImplementation(async (command, args, options) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      options!.listeners!.stdout!(Buffer.from('Organization: testOrg'));
      return Promise.resolve(0);
    });

    await client.checkRegistration('testOrg');

    expect(mockExec).toHaveBeenCalledWith(
      'warp-cli',
      ['--accept-tos', 'settings'],
      expect.anything()
    );
  });

  it('should throw error if not registered', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    mockExec.mockImplementation(async (command, args, options) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      options!.listeners!.stdout!(Buffer.from('Organization: wrongOrg'));
      return Promise.resolve(0);
    });

    await expect(client.checkRegistration('testOrg')).rejects.toThrow(
      'WARP is not registered'
    );
  });

  it('should check connection', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    mockExec.mockImplementation(async (command, args, options) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      options!.listeners!.stdout!(Buffer.from('Status update: Connected'));
      return Promise.resolve(0);
    });

    await client.checkConnection();

    expect(mockExec).toHaveBeenCalledWith(
      'warp-cli',
      ['--accept-tos', 'status'],
      expect.anything()
    );
  });

  it('should throw error if not connected', async () => {
    const mockExec = exec.exec as jest.MockedFunction<typeof exec.exec>;

    mockExec.mockImplementation(async (command, args, options) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      options!.listeners!.stdout!(Buffer.from('Status update: Disconnected'));
      return Promise.resolve(0);
    });

    await expect(client.checkConnection()).rejects.toThrow(
      'WARP is not connected'
    );
  });
});
