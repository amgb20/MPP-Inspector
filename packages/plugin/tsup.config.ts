import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    splitting: false,
    clean: true,
    dts: false,
    sourcemap: true,
    banner: { js: "#!/usr/bin/env node" },
    noExternal: [/^(?!mpp-inspector$)/],
  },
  {
    entry: { "hooks/session-check": "src/hooks/session-check.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    splitting: false,
    clean: false,
    dts: false,
    sourcemap: true,
  },
]);
