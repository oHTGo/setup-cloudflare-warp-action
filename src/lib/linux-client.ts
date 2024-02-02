import * as exec from '@actions/exec';
import * as fs from 'fs/promises';
import * as tc from '@actions/tool-cache';
import { ConfigurationParams, WARPClient } from '../interfaces';

class LinuxClient implements WARPClient {
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
    await exec.exec('sudo mkdir -p /var/lib/cloudflare-warp/');
    await fs.writeFile('/tmp/mdm.xml', config);
    await exec.exec('sudo mv /tmp/mdm.xml /var/lib/cloudflare-warp/');
  }

  async install(version?: string) {
    const gpgKeyPath = await tc.downloadTool(
      'https://pkg.cloudflareclient.com/pubkey.gpg'
    );
    await exec.exec(
      `/bin/bash -c "cat ${gpgKeyPath} | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg"`
    );
    await exec.exec('echo "DEBUG"');
    await exec.exec(
      `/bin/bash -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list'`
    );
    await exec.exec('sudo apt update');

    if (version) {
      await exec.exec(`sudo apt install -y cloudflare-warp=${version}`);
    } else {
      await exec.exec('sudo apt install -y cloudflare-warp');
    }
  }

  async checkRegistration(organization: string, isRegistered: boolean) {
    let output = '';
    await exec.exec('warp-cli', ['--accept-tos', 'settings'], {
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        }
      }
    });
    const registered = output.includes(`Organization: ${organization}`);
    if (isRegistered && !registered) {
      throw new Error('WARP is not registered');
    } else if (!isRegistered && registered) {
      throw new Error('WARP is still registered');
    }
  }

  async connect() {
    await exec.exec('warp-cli', ['--accept-tos', 'connect']);
  }

  async disconnect() {
    await exec.exec('warp-cli', ['--accept-tos', 'disconnect']);
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
    if (!output.includes('Status update: Connected')) {
      throw new Error('WARP is not connected');
    }
  }

  async cleanup() {
    await exec.exec('sudo rm /var/lib/cloudflare-warp/mdm.xml');
  }
}

export default LinuxClient;
