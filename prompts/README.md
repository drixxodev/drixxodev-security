# prompts/

All LLM prompts live here as **versioned files** — this is the core IP of the platform (§10).

## Conventions

- One file per prompt, named `[automation-type]-v[N].txt` or `.md`.
  Example: `email-triage-v1.md`
- Every prompt instructs the model to respond with **JSON only** (§6.3).
- When you update a prompt, bump the version number — do not edit in-place.
  Keep old versions for audit and rollback.
- Prompts are loaded at runtime by the automation modules; they are never
  hardcoded inline.

## Security

- Prompt files are server-side only — never bundled into the client/browser.
- Do not embed secrets, client data, or PII in prompt files.

Filled in during **Phase M2** (email triage prompt).
