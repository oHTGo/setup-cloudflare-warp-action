import * as exec from '@actions/exec';
import * as fs from 'fs/promises';
import BaseClient from './base-client';
import type { ConfigurationParams } from '../types';

class MacClient extends BaseClient {
  async writeConfigurations({
    organization,
    authClientID,
    authClientSecret
  }: ConfigurationParams) {
    const config = `
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
  <dict>
      <key>enable</key>
      <true />
      <key>organization</key>
      <string>${organization}</string>
      <key>auth_client_id</key>
      <string>${authClientID}</string>
      <key>auth_client_secret</key>
      <string>${authClientSecret}</string>
      <key>service_mode</key>
      <string>warp</string>
      <key>auto_connect</key>
      <integer>1</integer>
    </dict>
    </plist>`;
    await exec.exec(`sudo mkdir -p "/Library/Managed Preferences/"`);
    fs.writeFile('/tmp/com.cloudflare.warp.plist', config);
    await exec.exec('plutil -convert binary1 /tmp/com.cloudflare.warp.plist');
    await exec.exec(
      'sudo mv /tmp/com.cloudflare.warp.plist "/Library/Managed Preferences/"'
    );
  }

  async install(version?: string) {
    if (version) {
      await exec.exec(`brew install --cask cloudflare-warp@${version}`);
    } else {
      await exec.exec('brew install --cask cloudflare-warp');
    }
  }

  async cleanup() {
    await exec.exec(
      `sudo rm "/Library/Managed Preferences/com.cloudflare.warp.plist"`
    );
  }
}

export default MacClient;
