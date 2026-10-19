import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  language: "pt-BR",
  locale: null as string | null,
  createClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "accept-language": mocks.language }),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import NotFound from "@/app/not-found";
import InternalErrorPage from "@/app/500/page";
import ServiceUnavailablePage from "@/app/503/page";

beforeEach(() => {
  mocks.language = "pt-BR";
  mocks.locale = null;
  mocks.createClient.mockReset().mockResolvedValue({
    auth: {
      getUser: async () => ({
        data: { user: mocks.locale ? { user_metadata: { locale: mocks.locale } } : null },
      }),
    },
  });
});

describe("páginas de erro respeitam a preferência de quem chegou", () => {
  it.each([
    ["404", NotFound, "Página não encontrada"],
    ["500", InternalErrorPage, "Erro interno"],
    ["503", ServiceUnavailablePage, "Em manutenção"],
  ] as const)("%s usa português do navegador sem sessão", async (_code, page, title) => {
    expect(renderToStaticMarkup(await page())).toContain(title);
  });

  it.each([NotFound, InternalErrorPage])(
    "a preferência chinesa salva prevalece sobre o navegador português",
    async (page) => {
      mocks.locale = "zh-CN";
      const html = renderToStaticMarkup(await page());
      expect(html).toMatch(/[\u4e00-\u9fff]/);
      expect(html).not.toContain("Página não encontrada");
      expect(html).not.toContain("Erro interno");
    },
  );

  it("manutenção usa chinês sem depender do banco indisponível", async () => {
    mocks.language = "zh-CN,pt-BR;q=0.8";
    mocks.createClient.mockRejectedValue(new Error("database unavailable"));
    const html = renderToStaticMarkup(await ServiceUnavailablePage());
    expect(html).toMatch(/[\u4e00-\u9fff]/);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
