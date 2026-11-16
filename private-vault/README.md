# Bhagavan Private Vault

This directory is reserved for a secure personal file vault alongside the CA Final Performance Tracker.

## Security boundary

**Do not upload private documents, passwords, API tokens, or encryption keys into this public repository.** GitHub Pages is public and cannot act as a secure file-storage backend.

## Planned architecture

- A password-protected responsive web interface for upload, browse, search, preview, download, and delete.
- A separate authenticated serverless backend that stores credentials only as environment secrets.
- A **private** GitHub repository for encrypted file blobs, or an appropriately secured object-storage service.
- Rate-limited login, authenticated file operations, and a clear retention/deletion policy.

## Deployment status

Not deployed. No private storage or authentication service is configured yet.

The existing CA Final Performance Tracker files and routes are unchanged.
