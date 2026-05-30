/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep config minimal and boring for M0.
  // No public env vars exposed to the browser — LLM keys and OAuth secrets
  // live only in server-side process.env (§7 security rules).
};

export default nextConfig;
