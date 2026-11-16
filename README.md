# Bhagavan Private Vault

This repository now hosts a browser-based encrypted personal vault. The original CA Final tracker is preserved in branch `backup-ca-tracker-2026-11-16`.

## Use

Open the GitHub Pages website. Generate a **fine-grained GitHub personal access token** limited to this repository with **Contents: Read and write** permissions. Enter it along with a long unique vault passphrase. The token and passphrase are kept only in page memory and must be re-entered on each device.

Encrypted file payloads are written to `vault-data/` in this public repository. The app encrypts file contents and filenames before upload. **Anyone can download the ciphertext and see commit history**; do not treat this as a substitute for private storage. GitHub commit history retains encrypted copies after deletion. Password loss means permanent loss of access.

## Security limitations

This is a browser-only encrypted vault, not a fully hardened cloud storage service. A compromised public website or malicious update could steal secrets typed into it. Use a dedicated private repository and authenticated server backend for sensitive data. GitHub Pages is publicly readable and does not provide login enforcement. Files limited to 5 MB. No password recovery, sharing, or server-side rate limiting. Do not reuse passwords.

## Backup

Original website: `backup-ca-tracker-2026-11-16` branch.
