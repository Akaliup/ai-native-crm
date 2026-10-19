import { execFile } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const exec = promisify(execFile);
const probe = resolve("scripts/sonda-pi-na-imagem.mjs");

describe("a imagem entrega o SDK real do agente", () => {
  it("a sonda carrega os módulos e o catálogo sem chamada ao modelo", async () => {
    const { stdout } = await exec(process.execPath, [probe]);
    expect(stdout).toContain("Pi SDK and provider data loaded");
  });

  it("a mesma sonda reprova um diretório sem as dependências", async () => {
    const dir = mkdtempSync(join(tmpdir(), "crm-pi-probe-"));
    try {
      const isolatedProbe = join(dir, "probe.mjs");
      copyFileSync(probe, isolatedProbe);
      await expect(exec(process.execPath, [isolatedProbe], { cwd: dir })).rejects.toMatchObject({
        code: 1,
      });
    } finally {
      if (dirname(dir) === resolve(tmpdir())) rmSync(dir, { recursive: true, force: true });
    }
  });

  it("o job executa a sonda no app da imagem construída", () => {
    const workflow = readFileSync(".github/workflows/publish-image.yml", "utf8");
    expect(workflow).toContain("docker cp scripts/sonda-pi-na-imagem.mjs smoke:/app/");
    expect(workflow).toContain("docker exec smoke node /app/sonda-pi-na-imagem.mjs");
  });
});
