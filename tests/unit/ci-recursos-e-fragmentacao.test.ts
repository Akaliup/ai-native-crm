import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ler = (nome: string) => readFileSync(`.github/workflows/${nome}.yml`, "utf8");

describe("recursos do CI após importação do snapshot", () => {
  it("preserva os quatro shards e o total usado pelo comando", () => {
    const ci = ler("ci");
    const partes = /parte: \[([^\]]+)\]/.exec(ci)?.[1]?.split(",").map(Number);
    expect(partes).toEqual([1, 2, 3, 4]);
    expect(ci).toContain("--shard=${{ matrix.parte }}/4");
    expect(ci).toContain("needs: [verify-parte]");
    expect(ci).toContain('ORCAMENTO_MIN: "12"');
  });

  it.each(["perf", "e2e"])("%s dá heap ao typecheck sem desligá-lo", (nome) => {
    const workflow = ler(nome);
    expect(workflow).toContain('NODE_OPTIONS: "--max-old-space-size=4096"');
    expect(workflow).not.toContain("TSC_COMPILE_ON_ERROR");
    expect(workflow).not.toContain("ignoreBuildErrors");
  });
});
