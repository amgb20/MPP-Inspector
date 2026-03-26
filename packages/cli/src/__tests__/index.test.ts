import { describe, it, expect, vi } from "vitest";
import { Command } from "commander";

describe("CLI program", () => {
  it("registers all expected commands", async () => {
    const registeredCommands: string[] = [];
    const originalAddCommand = Command.prototype.addCommand;

    Command.prototype.addCommand = function (cmd: Command) {
      registeredCommands.push(cmd.name());
      return originalAddCommand.call(this, cmd);
    };

    const origParse = Command.prototype.parse;
    Command.prototype.parse = vi.fn().mockReturnValue(undefined) as any;

    // Re-import to trigger registration
    const indexModule = await import("../index.js");
    indexModule.run();

    Command.prototype.addCommand = originalAddCommand;
    Command.prototype.parse = origParse;

    const expected = ["inspect", "flow", "validate", "benchmark", "session", "compare", "scan"];
    for (const cmd of expected) {
      expect(registeredCommands).toContain(cmd);
    }
  });
});
