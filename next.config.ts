import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Cache Components defaults every route to static and requires each dynamic data
  // access (params, session, tenant queries) to opt in via Suspense/"use cache"/instant.
  // GatePass's architecture keeps tenant/request data dynamic and uncached everywhere
  // (see gatepass-architecture skill), which is the opposite default, so this stays off.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
