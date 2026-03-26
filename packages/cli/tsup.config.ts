import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { "bin/mpp-inspector": "bin/mpp-inspector.ts" },
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
    splitting: true,
    clean: false,
    dts: false,
    sourcemap: true,
  },
]);
