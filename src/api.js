const BASE = "http://localhost:3000";
const KEY = "demo-komuk-2026";
const MODULO = "buscador-de-stock";

async function pedir(ruta, init) {
  const headers = {
    "X-API-Key": KEY,
  };
  if (init && init.body) headers["Content-Type"] = "application/json";
  if (init && init.headers) Object.assign(headers, init.headers);

  const res = await fetch(BASE + ruta, Object.assign({}, init, { headers }));

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // el Hub no devolvió JSON (ej. 204)
  }

  if (!res.ok) {
    const mensaje =
      data && data.error && data.error.message
        ? data.error.message
        : "Error " + res.status + " al pedirle datos al Hub.";
    throw new Error(mensaje);
  }

  return data;
}

/** Lista productos; filtros opcionales: proveedor, estado, canal, deposito, q. */
export function listarProductos(filtros) {
  const params = new URLSearchParams();
  if (filtros) {
    for (const clave of Object.keys(filtros)) {
      const valor = filtros[clave];
      if (valor !== undefined && valor !== null && valor !== "") params.set(clave, valor);
    }
  }
  const query = params.toString();
  return pedir("/api/v1/productos" + (query ? "?" + query : ""));
}

/** Trae el detalle completo de un producto por id. */
export function obtenerProducto(id) {
  return pedir("/api/v1/productos/" + id);
}

/** Lista todas las técnicas de estampado disponibles, con sus costos. */
export function listarTecnicas() {
  return pedir("/api/v1/tecnicas");
}

/** Calcula el precio de venta de un producto con una técnica y cantidad dadas. */
export function cotizar(datos) {
  return pedir("/api/v1/cotizaciones", {
    method: "POST",
    body: JSON.stringify({
      productoId: datos.productoId,
      tecnicaId: datos.tecnicaId,
      cantidad: datos.cantidad,
    }),
  });
}

/** Aprueba un producto pendiente: asigna depósito, técnica e imágenes por canal. */
export function aprobarProducto(id, config) {
  return pedir("/api/v1/productos/" + id + "/aprobar", {
    method: "POST",
    body: JSON.stringify(config),
  });
}

/** Manda un producto a lista negra (lo saca del flujo de aprobación). */
export function mandarAListaNegra(id) {
  return pedir("/api/v1/productos/" + id + "/lista-negra", { method: "POST" });
}

/** Publica un producto ya aprobado en Mercado Libre. */
export function publicarEnML(id) {
  return pedir("/api/v1/productos/" + id + "/publicar-ml", { method: "POST" });
}

/** Registra en el Hub una solicitud de algo que este módulo todavía no puede hacer. */
export function crearSolicitud(datos) {
  return pedir("/api/v1/solicitudes", {
    method: "POST",
    body: JSON.stringify({
      modulo: datos.modulo,
      titulo: datos.titulo,
      detalle: datos.detalle,
      contexto: datos.contexto,
    }),
  });
}

/** Consulta las solicitudes que este módulo le hizo al Hub (estado y respuesta de Matías). */
export async function misSolicitudes() {
  return pedir(`/api/v1/solicitudes?modulo=${MODULO}`);
}
