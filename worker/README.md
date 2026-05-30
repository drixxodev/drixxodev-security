# worker/

This directory contains the long-running Node worker process that drives the automation engine (§6.4).

The worker is a **separate process** from the Next.js app — serverless functions are the wrong fit for scheduled, long-running polling jobs (see CLAUDE.md §4).

## What goes here (filled in during M2)

- `worker/index.ts` — entry point; bootstraps the poll loop.
- Per-automation poll-loop registrations (delegating to `automations/[type]/poll.ts`).
- Graceful shutdown handling (SIGTERM).

## How it runs

In development: `node --loader ts-node/esm worker/index.ts` (or via tsx).
In production (Railway): a dedicated process alongside the Next.js web process.

Filled in during **Phase M2**.
