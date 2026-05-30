/**
 * app/page.tsx — Root page (M0 stub).
 *
 * Placeholder page for the M0 skeleton. Real onboarding UI comes in M4.
 * No internal details (prompts, API keys, automation logic) are shown here — §2.
 */

export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
        color: "#111",
      }}
    >
      <h1>Platform is running.</h1>
      <p style={{ color: "#555" }}>
        Onboarding and dashboard are coming soon.
      </p>
    </main>
  );
}
