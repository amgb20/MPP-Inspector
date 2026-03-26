import { createMockServer } from "../src/server.js";

const args = process.argv.slice(2);

let port = 3402;
let host = "0.0.0.0";

for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--port" || args[i] === "-p") && args[i + 1]) {
    port = parseInt(args[i + 1], 10);
    i++;
  } else if ((args[i] === "--host" || args[i] === "-h") && args[i + 1]) {
    host = args[i + 1];
    i++;
  } else if (args[i] === "--help") {
    console.log(`
  Usage: mpp-mock-server [options]

  Mock MPP server for testing and demoing mpp-inspector.
  Serves valid 402 Payment Required challenges on demo endpoints.

  Options:
    -p, --port <number>  Port to listen on (default: 3402)
    -h, --host <string>  Host to bind to (default: 0.0.0.0)
        --help           Show this help message
`);
    process.exit(0);
  }
}

const mock = createMockServer({ port, host });
await mock.start();

process.on("SIGINT", async () => {
  console.log("\n  Shutting down...");
  await mock.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mock.stop();
  process.exit(0);
});
