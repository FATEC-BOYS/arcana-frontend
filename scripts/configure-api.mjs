import { writeFileSync } from "node:fs";
const value = process.env.ARCANA_API_BASE_URL;
if (value) {
  const local = /^\/(?!\/)/.test(value);
  if (!local) {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error(
        "ARCANA_API_BASE_URL must be a public HTTP(S) API base URL without credentials, query or fragment",
      );
  }
  writeFileSync(
    "public/arcana-config.js",
    `window.ARCANA_CONFIG = ${JSON.stringify({ apiBaseUrl: value.replace(/\/$/, "") })};\n`,
  );
}
