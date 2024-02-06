import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { existsSync } from 'fs';
import { mkdir, writeFile, rm } from 'fs/promises';
import BaseClient from './base-client';
import type { ConfigurationParams } from '../types';

class WinClient extends BaseClient {
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
    if (!existsSync('C:\\ProgramData\\Cloudflare'))
      await mkdir('C:\\ProgramData\\Cloudflare');
    await writeFile('C:\\ProgramData\\Cloudflare\\mdm.xml', config);
  }

  async install(version?: string) {
    if (version) {
      await exec.exec(`choco install -y warp --version=${version}}`);
    } else {
      await exec.exec('choco install -y warp');
    }
    core.addPath('C:\\Program Files\\Cloudflare\\Cloudflare WARP\\');
  }

  async cleanup() {
    await rm('C:\\ProgramData\\Cloudflare\\mdm.xml', {
      force: true
    });
  }
}

export default WinClient;
