import * as core from '@actions/core';
import { post } from '../../src/post';
import { getClient } from '../../src/common';
import BaseClient from '../../src/libs/base-client';

jest.mock('@actions/core');
jest.mock('../src/common');

describe('post script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call client methods with correct parameters', async () => {
    const mockGetClient = getClient as jest.MockedFunction<typeof getClient>;
    const mockClient = {
      disconnect: jest.fn(),
      cleanup: jest.fn()
    };
    mockGetClient.mockReturnValue(mockClient as unknown as BaseClient);

    const mockGetState = core.getState as jest.MockedFunction<
      typeof core.getState
    >;
    mockGetState.mockReturnValue('true');

    await post();

    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(mockClient.cleanup).toHaveBeenCalled();
    expect(core.getState).toHaveBeenCalledWith('connected');
  });

  it('should handle errors', async () => {
    const mockGetClient = getClient as jest.MockedFunction<typeof getClient>;
    const mockClient = {
      disconnect: jest.fn(),
      cleanup: jest.fn()
    };
    mockGetClient.mockReturnValue(mockClient as unknown as BaseClient);

    const error = new Error('Test error');
    mockClient.disconnect.mockRejectedValue(error);

    await post();

    expect(core.setFailed).toHaveBeenCalledWith(error.message);
  });
});
