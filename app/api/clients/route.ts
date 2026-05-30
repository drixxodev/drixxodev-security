/**
 * app/api/clients/route.ts — Minimal Client CRUD (M0).
 *
 * POST /api/clients  — create a new Client record.
 * GET  /api/clients  — list all Client records.
 *
 * This proves the DB wiring works (§9 M0 acceptance). No auth is required at
 * this stage — auth/operator gating is added in M4.
 *
 * force-dynamic ensures Next.js never tries to statically evaluate this route
 * at build time (which would fail without a live DATABASE_URL).
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// POST /api/clients
// ---------------------------------------------------------------------------

interface CreateClientBody {
  name: string;
  contactEmail: string;
  plan?: string;
}

function isCreateClientBody(body: unknown): body is CreateClientBody {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return typeof b.name === "string" && typeof b.contactEmail === "string";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (!isCreateClientBody(body)) {
    return NextResponse.json(
      { error: "Missing required fields: name, contactEmail." },
      { status: 400 }
    );
  }

  const { name, contactEmail, plan } = body;

  // Basic email format check — full validation added when auth is wired in M4.
  if (!contactEmail.includes("@")) {
    return NextResponse.json(
      { error: "contactEmail must be a valid email address." },
      { status: 400 }
    );
  }

  try {
    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        ...(plan ? { plan } : {}),
      },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        status: true,
        plan: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ client }, { status: 201 });
  } catch (err: unknown) {
    // Unique-constraint violation (duplicate contactEmail)
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        { error: "A client with that email already exists." },
        { status: 409 }
      );
    }
    console.error("[POST /api/clients] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/clients
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        contactEmail: true,
        status: true,
        plan: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ clients });
  } catch (err: unknown) {
    console.error("[GET /api/clients] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
