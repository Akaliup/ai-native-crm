import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  org: vi.fn(),
  read: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/auth/server", () => ({
  requireAuth: async () => ({ full_name: "Lin", is_platform_admin: false, support: null }),
  resolveActiveOrg: mocks.org,
}));
vi.mock("@/lib/home/read-home-dashboard", () => ({ readHomeDashboard: mocks.read }));
vi.mock("./_components/HomeDashboard", () => ({ HomeDashboard: () => null }));

import AppHome from "./page";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.read.mockResolvedValue({});
});

describe("a página inicial respeita a interface configurada", () => {
  it.each(["/app/products", "/app/tasks"])(
    "abre a área escolhida %s antes do dashboard",
    async (path) => {
      mocks.org.mockResolvedValue({
        orgId: "org",
        role: "admin",
        interface_settings: { preset: "completa", destinos: [path] },
      });
      await expect(AppHome()).rejects.toThrow(`redirect:${path}`);
      expect(mocks.read).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, { preset: "completa", destinos: ["/app"] }])(
    "mantém o dashboard quando a home está disponível",
    async (settings) => {
      mocks.org.mockResolvedValue({ orgId: "org", role: "admin", interface_settings: settings });
      await AppHome();
      expect(mocks.redirect).not.toHaveBeenCalled();
      expect(mocks.read).toHaveBeenCalledWith("org", true);
    },
  );
});
