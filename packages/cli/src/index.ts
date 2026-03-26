import { Command } from "commander";
import { inspectCommand } from "./commands/inspect.js";
import { flowCommand } from "./commands/flow.js";
import { validateCommand } from "./commands/validate.js";
import { benchmarkCommand } from "./commands/benchmark.js";
import { sessionCommand } from "./commands/session.js";
import { compareCommand } from "./commands/compare.js";
import { scanCommand } from "./commands/scan.js";

const program = new Command();

program
  .name("mpp-inspector")
  .description("Testing and debugging toolkit for Machine Payments Protocol")
  .version("0.1.0");

program.addCommand(inspectCommand);
program.addCommand(flowCommand);
program.addCommand(validateCommand);
program.addCommand(benchmarkCommand);
program.addCommand(sessionCommand);
program.addCommand(compareCommand);
program.addCommand(scanCommand);

export function run(): void {
  program.parse();
}
