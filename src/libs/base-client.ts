import * as exec from '@actions/exec';
import type { ConfigurationParams } from '../types';

abstract class BaseClient {
  abstract writeConfigurations(
    configuration: ConfigurationParams
  ): Promise<void>;
  abstract install(version?: string): Promise<void>;
  abstract cleanup(): Promise<void>;

  async connect() {
    await exec.exec('warp-cli', ['--accept-tos', 'connect']);
  }

  async disconnect() {
    await exec.exec('warp-cli', ['--accept-tos', 'disconnect']);
  }

  async checkRegistration(organization: string) {
    let output = '';
    await exec.exec('warp-cli', ['--accept-tos', 'settings'], {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        }
      }
    });
    const registered = output.includes(`Organization: ${organization}`);
    if (!registered) {
      throw new Error('WARP is not registered');
    }
  }

  async checkConnection() {
    let output = '';
    await exec.exec('warp-cli', ['--accept-tos', 'status'], {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        }
      }
    });
    const connected = output.includes('Status update: Connected');
    if (!connected) {
      throw new Error('WARP is not connected');
    }
  }
}

export default BaseClient;
