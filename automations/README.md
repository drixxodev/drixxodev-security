# automations/

Each automation type is its own module in a subdirectory: `automations/[type]/`.

## Required exports per module (§6.4)

- `poll(client, config)` — queries the client's connected provider for new items to process.
- `process(item)` — runs the LLM logic for a single item and writes results back to the client's tool.

## Example layout (M2)

```
automations/
  email_triage/
    index.ts      — re-exports poll + process
    poll.ts       — Gmail polling logic
    process.ts    — LLM call + draft/label write-back
```

## Conventions (§10)

- Every external call wrapped in try/catch; failures recorded on the `Run` row.
- Filter before the LLM — not every item needs a model call (§8.3).
- Cache/dedupe repeated inputs (§8.4).
- Prompts live in `prompts/` (versioned), not inlined here.

Filled in during **Phase M2**.
