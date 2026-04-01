import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Test per il middleware api-token-auth.
 * Simula il contesto Koa (ctx) e verifica i vari scenari di autenticazione.
 */

// Helper per creare un finto ctx Koa
function createMockCtx(path, authHeader) {
  return {
    request: {
      path,
      header: authHeader ? { authorization: authHeader } : {},
    },
    status: 200,
    body: null,
  };
}

// Helper per creare un finto strapi
function createMockStrapi() {
  return {
    log: {
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    },
  };
}

describe("api-token-auth middleware", () => {
  const originalEnv = process.env.FRONTEND_API_TOKEN;

  afterEach(() => {
    // Ripristina env
    if (originalEnv !== undefined) {
      process.env.FRONTEND_API_TOKEN = originalEnv;
    } else {
      delete process.env.FRONTEND_API_TOKEN;
    }
  });

  function loadMiddleware() {
    // Il middleware è una factory: (config, { strapi }) => async (ctx, next)
    const factory = require("../src/middlewares/api-token-auth");
    const strapi = createMockStrapi();
    return { handler: factory({}, { strapi }), strapi };
  }

  it("lascia passare le rotte non-API (es. /admin)", async () => {
    process.env.FRONTEND_API_TOKEN = "test-token-123";
    const { handler } = loadMiddleware();
    const ctx = createMockCtx("/admin/settings", null);
    const next = vi.fn();

    await handler(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.status).toBe(200);
  });

  it("lascia passare /uploads", async () => {
    process.env.FRONTEND_API_TOKEN = "test-token-123";
    const { handler } = loadMiddleware();
    const ctx = createMockCtx("/uploads/image.png", null);
    const next = vi.fn();

    await handler(ctx, next);

    expect(next).toHaveBeenCalled();
  });

  it("blocca con 500 se FRONTEND_API_TOKEN non configurato", async () => {
    delete process.env.FRONTEND_API_TOKEN;
    const { handler, strapi } = loadMiddleware();
    const ctx = createMockCtx("/api/home", "Bearer qualsiasi");
    const next = vi.fn();

    await handler(ctx, next);

    expect(ctx.status).toBe(500);
    expect(ctx.body.error).toContain("Configurazione server non valida");
    expect(next).not.toHaveBeenCalled();
    expect(strapi.log.error).toHaveBeenCalled();
  });

  it("blocca con 403 se manca header Authorization", async () => {
    process.env.FRONTEND_API_TOKEN = "test-token-123";
    const { handler } = loadMiddleware();
    const ctx = createMockCtx("/api/home", null);
    const next = vi.fn();

    await handler(ctx, next);

    expect(ctx.status).toBe(403);
    expect(ctx.body.error).toContain("mancante");
    expect(next).not.toHaveBeenCalled();
  });

  it("blocca con 403 se header non è Bearer", async () => {
    process.env.FRONTEND_API_TOKEN = "test-token-123";
    const { handler } = loadMiddleware();
    const ctx = createMockCtx("/api/home", "Basic abc123");
    const next = vi.fn();

    await handler(ctx, next);

    expect(ctx.status).toBe(403);
    expect(ctx.body.error).toContain("mancante");
    expect(next).not.toHaveBeenCalled();
  });

  it("blocca con 403 se token è sbagliato", async () => {
    process.env.FRONTEND_API_TOKEN = "test-token-123";
    const { handler } = loadMiddleware();
    const ctx = createMockCtx("/api/home", "Bearer token-sbagliato");
    const next = vi.fn();

    await handler(ctx, next);

    expect(ctx.status).toBe(403);
    expect(ctx.body.error).toContain("non valido");
    expect(next).not.toHaveBeenCalled();
  });

  it("lascia passare con token corretto", async () => {
    process.env.FRONTEND_API_TOKEN = "test-token-123";
    const { handler } = loadMiddleware();
    const ctx = createMockCtx("/api/home", "Bearer test-token-123");
    const next = vi.fn();

    await handler(ctx, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.status).toBe(200);
  });

  it("lascia passare /api/site-settings con token corretto", async () => {
    process.env.FRONTEND_API_TOKEN = "my-secret";
    const { handler } = loadMiddleware();
    const ctx = createMockCtx("/api/site-settings", "Bearer my-secret");
    const next = vi.fn();

    await handler(ctx, next);

    expect(next).toHaveBeenCalled();
  });
});
