import "server-only";

const REDACTED_KEYS = new Set([
  "token",
  "tokenHash",
  "password",
  "cookie",
  "secret",
]);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        REDACTED_KEYS.has(k.toLowerCase()) ? "[redacted]" : redact(v),
      ]),
    );
  }
  return value;
}

type Level = "info" | "warn" | "error";

function log(level: Level, event: string, fields?: Record<string, unknown>) {
  const line = {
    level,
    event,
    time: new Date().toISOString(),
    ...(fields ? (redact(fields) as object) : {}),
  };
  const out =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;
  out(JSON.stringify(line));
}

/** Structured JSON logging. Never pass tokens, token hashes, passwords or cookies directly —
 * REDACTED_KEYS catches the common names, but callers still shouldn't rely on it for secrets
 * they control the shape of. */
export const logger = {
  info: (event: string, fields?: Record<string, unknown>) =>
    log("info", event, fields),
  warn: (event: string, fields?: Record<string, unknown>) =>
    log("warn", event, fields),
  error: (event: string, fields?: Record<string, unknown>) =>
    log("error", event, fields),
};
