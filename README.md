# A Cloudflare WARP GitHub Action Using TypeScript

The action sets up Cloudflare WARP in your GitHub Actions workflow. It allows
GitHub Actions workflows to access resources that are secured by Cloudflare Zero
Trust.

## Requirements

The action currently only supports Linux, MacOS and Windows (self-hosted
runner). On the GitHub hosted runner, Windows has not enabled the **wlansvc**,
so WARP cannot start.

Windows setup steps:

- Open Powershell with **Administration**
- Install [Choco](https://chocolatey.org/install)
- Install wlansvc `Install-WindowsFeature -Name Wireless-Networking`
- Reboot
- Set the service to automatically start
  `Set-Service WlanSvc -startuptype automatic -passthru`
- Start the service `Start-Service WlanSvc -passthru`

## Usage

To use this action, generate a service token using these
[instructions](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens)
and configure the action:

```
uses: oHTGo/setup-cloudflare-warp-action@master
with:
  organization: your-organization
  auth_client_id: ${{ secrets.AUTH_CLIENT_ID }}
  auth_client_secret: ${{ secrets.AUTH_CLIENT_SECRET }}
```

## Inputs

- organization - (required) The name of your Cloudflare Zero Trust organization.
- auth_client_id - (required) The service token client id.
- auth_client_secret - (required) The service token client secret.
- version - (optional) The version of Cloudflare WARP to install. Defaults to
  the latest version.

## Troubleshooting

1. `Status update: Unable to connect. Reason: Registration Missing`:

- Check that the service token is valid and not expired.
- Check that the service token has the appropriate
  [permissions](https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/deployment/device-enrollment/#check-for-service-token)
  to connect.
- Cancel and restart the job, sometimes there's an issue on Cloudflare's end
  that causes this error.

## Inspired from

- [setup-cloudflare-warp](https://github.com/Boostport/setup-cloudflare-warp) by
  `Boostport`
