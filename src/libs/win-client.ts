import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as fs from 'fs/promises';
import { ConfigurationParams, WARPClient } from '../interfaces';

class WinClient implements WARPClient {
  async writeConfigurations({
    organization,
    authClientID,
    authClientSecret
  }: ConfigurationParams) {
    const config = `
<dict>
    <key>organization</key>
    <string>${organization}</string>
    <key>auth_client_id</key>
    <string>${authClientID}</string>
    <key>auth_client_secret</key>
    <string>${authClientSecret}</string>
</dict>`;
    await fs.mkdir(`C:\\ProgramData\\Cloudflare`);
    await fs.writeFile(`C:\\ProgramData\\Cloudflare\\mdm.xml`, config);
  }

  async install() {
    await exec.exec(`choco install -y warp`);
    core.addPath(`C:\\Program Files\\Cloudflare\\Cloudflare WARP\\`);
  }

  async cleanup() {
    await fs.rm(`C:\\ProgramData\\Cloudflare\\mdm.xml`);
  }

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

export default WinClient;
