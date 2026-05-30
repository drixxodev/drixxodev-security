/**
 * app/layout.tsx — Root layout (M0 stub).
 *
 * This is a minimal placeholder. The real onboarding UI and operator dashboard
 * are built in Phase M4 by the frontend agent.
 *
 * Note: NO internal implementation details (prompts, keys, how-it-works) are
 * exposed here per §2 (core principle).
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drixxodev Platform",
  description: "Managed automation platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
