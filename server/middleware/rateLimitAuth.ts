import { enforceRateLimit } from "~~/server/utils/rateLimit";

export default defineEventHandler((event) => {
  const url = event.node.req.url ?? "";
  if (!url.startsWith("/api/auth/")) return;
  enforceRateLimit(event, {
    scope: "auth",
    windowMs: 60_000,
    max: 10,
  });
});
