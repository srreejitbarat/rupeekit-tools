# Hostinger deployment bootstrap

RupeeKit production is deployed from GitHub Actions to the Hostinger VPS.

The workflow is intentionally manual-only at first. After one successful manual
deployment from `main`, add the `push` trigger for `main` so every validated
main-branch change deploys automatically.

## GitHub Actions secrets

Create these repository Actions secrets:

- `HOSTINGER_SSH_HOST` — VPS IP or SSH hostname.
- `HOSTINGER_SSH_USER` — `rupeekit`.
- `HOSTINGER_SSH_PRIVATE_KEY` — private half of a dedicated CI deploy key.
- `HOSTINGER_KNOWN_HOSTS` — pinned SSH host-key line for the VPS.

Do not reuse a personal SSH key.

## VPS deployment wrapper

Copy `ops/hostinger/rupeekit-deploy` to
`/usr/local/sbin/rupeekit-deploy`, then make the installed copy root-owned and
non-writable by the deployment user.

The CI SSH public key should be added to
`/home/rupeekit/.ssh/authorized_keys` with a forced command pointing to:

`sudo -n /usr/local/sbin/rupeekit-deploy`

Disable PTY, agent forwarding, port forwarding, user rc, and X11 forwarding for
that key.

Allow only the fixed wrapper through sudo for the `rupeekit` user.

The tracked wrapper switches the repository's origin to public HTTPS before
fetching `main`, so no GitHub credential is required on the VPS for production
pulls.

## Deployment checks

The workflow fails unless:

- repository validation, typecheck, lint, tests and build pass;
- the remote deployment reports the same commit SHA as the workflow;
- production does not send an `X-Robots-Tag: noindex` header;
- the production homepage canonical remains `https://www.rupeekit.co.in`;
- the apex redirects to the canonical `www` hostname;
- staging continues to send `noindex`.
