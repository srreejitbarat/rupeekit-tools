# Hostinger deployment bootstrap

RupeeKit production is deployed from GitHub Actions to the Hostinger VPS.

The repository is private. Production therefore uses two separate, narrowly
scoped SSH credentials:

1. GitHub Actions -> Hostinger VPS: a dedicated CI key restricted to the fixed
   deployment wrapper.
2. Hostinger VPS -> GitHub: a dedicated read-only GitHub deploy key used only to
   fetch this private repository.

The workflow is intentionally manual-only at first. After one successful manual
deployment from `main`, add the `push` trigger for `main` so every validated
main-branch change deploys automatically.

## GitHub Actions secrets

Create these repository Actions secrets:

- `HOSTINGER_SSH_HOST` — VPS IP or SSH hostname.
- `HOSTINGER_SSH_USER` — `rupeekit`.
- `HOSTINGER_SSH_PRIVATE_KEY` — private half of a dedicated CI-to-VPS key.
- `HOSTINGER_KNOWN_HOSTS` — pinned SSH host-key line for the VPS.

Do not reuse a personal SSH key.

## Private repository deploy key on the VPS

Create a dedicated no-passphrase Ed25519 key at:

`/home/rupeekit/.ssh/id_ed25519_github_deploy`

Register only its public key in this repository under:

`Settings -> Deploy keys -> Add deploy key`

Leave **Allow write access** disabled. The production server only needs read
access.

Pin GitHub's SSH host key in:

`/home/rupeekit/.ssh/known_hosts_github`

The deployment wrapper uses both paths explicitly and refuses to fetch if either
is missing.

## VPS deployment wrapper

Copy `ops/hostinger/rupeekit-deploy` to
`/usr/local/sbin/rupeekit-deploy`, then make the installed copy root-owned and
non-writable by the deployment user.

The CI-to-VPS public key should be added to
`/home/rupeekit/.ssh/authorized_keys` with a forced command pointing to:

`sudo -n /usr/local/sbin/rupeekit-deploy`

Disable PTY, agent forwarding, port forwarding, user rc, and X11 forwarding for
that key.

Allow only the fixed wrapper through sudo for the `rupeekit` user.

The tracked wrapper fetches the private repository over SSH using the dedicated
read-only GitHub deploy key. It does not require a PAT and does not use the
personal interactive SSH key.

## Deployment checks

The workflow fails unless:

- repository validation, typecheck, lint, tests and build pass;
- the remote deployment reports the same commit SHA as the workflow;
- production does not send an `X-Robots-Tag: noindex` header;
- the production homepage canonical remains `https://www.rupeekit.co.in`;
- the apex redirects to the canonical `www` hostname;
- staging continues to send `noindex`.
