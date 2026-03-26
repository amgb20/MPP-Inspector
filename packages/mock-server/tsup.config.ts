import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { "bin/mpp-mock-server": "bin/mpp-mock-server.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    splitting: false,
    clean: true,
    dts: false,
    sourcemap: true,
    banner: { js: "#!/usr/bin/env node" },
  },
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
    target: "node18",
    platform: "node",
    splitting: false,
    clean: false,
    dts: false,
    sourcemap: true,
  },
]);
