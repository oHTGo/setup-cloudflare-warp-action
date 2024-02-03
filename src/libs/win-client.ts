import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { ConfigurationParams, WARPClient } from '../interfaces';

class WinClient implements WARPClient {
  async writeConfigurations(
    configuration: ConfigurationParams
  ): Promise<void> {}
  async install() {
    await exec.exec(`choco install -y warp`);
    core.addPath(`C:\\Program Files\\Cloudflare\\Cloudflare WARP\\`);

    let output = '';
    exec.exec('warp-cli.exe', ['--version'], {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        }
      }
    });
    core.info(output);
  }
  async cleanup(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async connect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async checkRegistration(organization: string): Promise<void> {
    console.log('Checking registration', organization);
    throw new Error('Method not implemented.');
  }
  async checkConnection(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export default WinClient;
