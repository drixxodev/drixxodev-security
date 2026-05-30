# providers/

Each OAuth provider integration is its own module: `providers/[provider]/`.

## Required per provider (§6.1)

- Build the authorization URL with `client_id`, requested scopes, `state` (CSRF token), and `redirect_uri`.
- Exchange the `code` for `access_token` + `refresh_token` on callback.
- Validate the OAuth `state` parameter on every callback — non-negotiable CSRF protection (§7.6).
- Implement refresh-token rotation so tokens stay valid without re-prompting the client (§6.1).
- Request the **minimum OAuth scopes** each automation actually needs (§7.5).

## Example layout (M1)

```
providers/
  gmail/
    index.ts      — re-exports authorize + callback + refresh
    authorize.ts  — builds Google consent screen URL
    callback.ts   — validates state, exchanges code, encrypts + stores tokens
    refresh.ts    — rotates access token using refresh token
```

## Security reminders (§7)

- Never store plaintext tokens — always encrypt via `lib/crypto.ts` before persisting.
- Never log token values.
- Always validate `state` before processing the callback.

Filled in during **Phase M1**.
