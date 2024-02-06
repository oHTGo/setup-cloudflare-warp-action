import * as core from '@actions/core';
import { main } from '../src/main';
import { getClient } from '../src/common';
import BaseClient from '../src/libs/base-client';

jest.mock('@actions/core');
jest.mock('../src/common');

describe('main script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call client methods with correct parameters', async () => {
    const mockGetInput = core.getInput as jest.MockedFunction<
      typeof core.getInput
    >;
    const mockGetClient = getClient as jest.MockedFunction<typeof getClient>;
    const mockClient = {
      writeConfigurations: jest.fn(),
      install: jest.fn(),
      checkRegistration: jest.fn(),
      connect: jest.fn(),
      checkConnection: jest.fn()
    };
    mockGetClient.mockReturnValue(mockClient as unknown as BaseClient);

    mockGetInput.mockImplementation(name => {
      switch (name) {
        case 'organization':
          return 'testOrg';
        case 'auth-client-id':
          return 'testID';
        case 'auth-client-secret':
          return 'testSecret';
        case 'version':
          return 'testVersion';
        case 'retry-limit':
          return '3';
        default:
          return '';
      }
    });

    await main();

    expect(mockClient.writeConfigurations).toHaveBeenCalledWith({
      organization: 'testOrg',
      authClientID: 'testID',
      authClientSecret: 'testSecret'
    });
    expect(mockClient.install).toHaveBeenCalledWith('testVersion');
    expect(mockClient.checkRegistration).toHaveBeenCalledWith('testOrg');
    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockClient.checkConnection).toHaveBeenCalled();
    expect(core.saveState).toHaveBeenCalledWith('connected', 'true');
  });

  it('should handle errors', async () => {
    const mockGetClient = getClient as jest.MockedFunction<typeof getClient>;
    const mockClient = {
      writeConfigurations: jest.fn(),
      install: jest.fn(),
      checkRegistration: jest.fn(),
      connect: jest.fn(),
      checkConnection: jest.fn()
    };
    mockGetClient.mockReturnValue(mockClient as unknown as BaseClient);

    const error = new Error('Test error');
    mockClient.writeConfigurations.mockRejectedValue(error);

    await main();

    expect(core.setFailed).toHaveBeenCalledWith(error.message);
  });
});
