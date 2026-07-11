import { describe, it, expect, vi, afterEach } from "vitest";
import { listarProductos, cotizar } from "./api.js";

function mockFetchOk(body) {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => body,
  }));
}

function mockFetchError(status, mensaje) {
  return vi.fn(async () => ({
    ok: false,
    status,
    json: async () => ({ error: { code: "algo", message: mensaje } }),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api.js", () => {
  it("listarProductos manda el header X-API-Key", async () => {
    const fetchMock = mockFetchOk({ total: 0, items: [] });
    vi.stubGlobal("fetch", fetchMock);

    await listarProductos();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["X-API-Key"]).toBe("demo-komuk-2026");
  });

  it("cotizar hace POST con el body correcto", async () => {
    const fetchMock = mockFetchOk({ precioUnitario: 1000 });
    vi.stubGlobal("fetch", fetchMock);

    await cotizar({ productoId: "p01", tecnicaId: "t1", cantidad: 100 });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ productoId: "p01", tecnicaId: "t1", cantidad: 100 });
  });

  it("cuando el Hub responde un error, tira un Error con ese message", async () => {
    vi.stubGlobal("fetch", mockFetchError(404, "No existe el producto p99."));

    await expect(listarProductos()).rejects.toThrow("No existe el producto p99.");
  });
});
