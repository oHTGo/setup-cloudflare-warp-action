# A Cloudflare WARP GitHub Action Using TypeScript

The action sets up Cloudflare WARP in your GitHub Actions workflow. It allows
GitHub Actions workflows to access resources that are secured by Cloudflare Zero
Trust.

## Requirements

On the GitHub-hosted runner, the action currently supports Linux, macOS and
Windows since
[Add WLAN AutoConfig service for Windows image](https://github.com/actions/runner-images/issues/9305)
issue was resolved.

## Usage

To use this action, generate a service token using these
[instructions](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens)
and configure the action:

```yaml
uses: oHTGo/setup-cloudflare-warp-action@master
with:
  organization: your-organization
  auth_client_id: ${{ secrets.AUTH_CLIENT_ID }}
  auth_client_secret: ${{ secrets.AUTH_CLIENT_SECRET }}
```

## Inputs

- organization - (required) The name of your Cloudflare Zero Trust organization.
- auth_client_id - (required) The service token client ID.
- auth_client_secret - (required) The service token client secret.
- version - (optional) The version of Cloudflare WARP to install. Defaults to
  the latest version.

## Troubleshooting

1. `Status update: Unable to connect. Reason: Registration Missing`

- Check that the service token is valid and not expired.
- Check that the service token has the appropriate
  [permissions](https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/warp/deployment/device-enrollment/#check-for-service-token)
  to connect.
- Cancel and restart the job, sometimes there's an issue on Cloudflare's end
  that causes this error.

## Inspired from

- [setup-cloudflare-warp](https://github.com/Boostport/setup-cloudflare-warp) by
  `Boostport`
