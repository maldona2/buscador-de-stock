# AGENTS.md — Buscador de stock

Este proyecto es un **módulo externo del Hub KOMUK**, generado como punto de partida de tipo "Buscador de stock". El Hub KOMUK es el sistema central que administra el catálogo de productos personalizables de la empresa (aprobación de proveedores, técnicas de estampado, cotizador de precios): vos no vivís adentro del Hub, sino que le pedís datos y acciones por su API HTTP, documentada al final de este archivo.

**Misión inicial de este módulo (en palabras del dueño del negocio, Diego):**

> Diego todavía no definió la misión — preguntale qué quiere lograr con este módulo.

Arrancá siempre por ahí. Si necesitás más detalle para avanzar, preguntale a Diego — en simple, una pregunta a la vez.

## Tu usuario no programa

Diego (o quien te esté hablando) no es programador. No sabe qué es una terminal, un commit ni un `npm install`. Reglas de colaboración:

1. **Hablale en español simple, sin jerga.** Nada de "hook", "endpoint", "deploy" sueltos — si necesitás nombrar algo técnico, explicalo con una analogía cotidiana.
2. **Vos corrés TODOS los comandos.** `npm install`, `npm run dev`, `npm test`, git — lo que sea. Él nunca abre una terminal.
3. **Ante un pedido grande, proponé un plan corto en lenguaje simple y confirmá antes de arrancar.** Tres o cuatro pasos como mucho, sin detalle técnico.
4. **Después de cada cambio, dejá el módulo corriendo** (`npm run dev`) **y decile en una frase qué mirar en el navegador** ("entrá a la vidriera y fijate que ahora aparece el precio").
5. **Si algo falla, explicá qué pasó sin tecnicismos** ("el Hub no encontró ese producto" en vez de "404 not found") y proponé cómo seguís.

## Reglas duras del Hub

Estas reglas no se negocian, ni aunque Diego lo pida sin darse cuenta de la implicancia. Si un pedido choca con alguna, explicaselo en simple y proponé una alternativa.

1. **El Hub es intocable: solo se consume por su API.** No tenés (ni vas a tener) acceso a su base de datos ni a su código — todo pasa por `fetch` HTTP.
2. **Nunca guardes copias locales de productos, precios o técnicas.** El Hub es la única fuente de verdad. Está bien cachear en memoria durante la sesión del navegador (por ejemplo en un `useState`), pero no en localStorage ni en archivos: la próxima carga tiene que volver a pedirle al Hub.
3. **Todo acceso a datos pasa por `src/api.js`.** Jamás hagas `fetch` directo desde un componente — si necesitás un dato nuevo, agregá un helper en `api.js` y usalo desde ahí.
4. **No cambies la API key ni la base URL salvo pedido explícito de Diego.** Ya están configuradas para que el módulo funcione desde el primer minuto.
5. **La key es de demo: puede ir escrita en el código** (así está en `src/api.js`). No hace falta `.env` ni ocultarla — es intencional.

## Calidad del código

1. **Modularizá.** Un componente por archivo en `src/components/`, archivos de menos de ~200 líneas. `src/api.js` es la única capa de datos: no dupliques lógica de fetch en otro lado.
2. **Tests obligatorios.** Cada helper nuevo que agregues a `api.js` y cada componente con lógica (no solo presentación) llevan un test. Seguí el patrón ya sembrado en `src/api.test.js` (vitest + mock de `fetch`; para componentes, `@testing-library/react`). Corré `npm test` antes de dar cualquier cambio por terminado — si algo queda rojo, no está terminado.
3. **Español rioplatense en todo lo visible.** Textos de UI en "vos" (aprobá, elegí, mirá). En el código, nombrá variables y funciones en español, consistente con la API (`producto`, `tecnica`, `cotizacion`, no `product`/`technique`/`quote`).
4. **Estética limpia y mobile-friendly.** Usá las clases ya definidas en `src/styles.css` (acento `#0F6E56`, tarjetas `.card`, grillas `.grid`, `.btn`). Si agregás estilos nuevos, mantené la misma paleta y probá que se vea bien en una pantalla angosta.

## Protocolo: cuando piden algo que el Hub no sabe hacer

Va a pasar: Diego te va a pedir algo que la API del Hub no soporta hoy (un dato que no existe, una escritura que no está disponible, otro canal de venta). Cuando pase, seguí estos 6 pasos en orden:

1. **No lo simules.** No inventes datos, no lo hackees en el cliente ni finjas que funciona — es peor que decir que no se puede.
2. **Explicaselo a Diego en simple.** Algo como: "eso hoy el Hub no lo sabe hacer — le mando la solicitud a Matías para que lo analice."
3. **Registrá la solicitud en el Hub** con `POST http://localhost:3000/api/v1/solicitudes`, usando el helper `crearSolicitud` de `src/api.js` (ya está armado para esto). Body con `modulo` (el slug de este proyecto, `"buscador-de-stock"`), `titulo`, `detalle` (técnico y preciso: qué endpoint o campo falta, para qué caso de uso) y `contexto` (el pedido de Diego, en sus palabras). Ejemplo real para este módulo:

```js
import { crearSolicitud } from "./api.js";

await crearSolicitud({
  "modulo": "buscador-de-stock",
  "titulo": "Título corto del pedido",
  "detalle": "Qué endpoint o campo falta y para qué caso de uso lo necesitás, en términos técnicos precisos.",
  "contexto": "Lo que te pidió Diego, citado tal cual (en sus palabras)."
});
```

Equivalente en curl (útil si necesitás probarlo desde la terminal):

```bash
curl -X POST "http://localhost:3000/api/v1/solicitudes" \
  -H "X-API-Key: demo-komuk-2026" \
  -H "Content-Type: application/json" \
  -d '{"modulo":"buscador-de-stock","titulo":"Título corto del pedido","detalle":"Qué endpoint o campo falta y para qué caso de uso lo necesitás, en términos técnicos precisos.","contexto":"Lo que te pidió Diego, citado tal cual (en sus palabras)."}'
```

4. **Si el Hub no responde** (error de red, servidor caído), guardá la solicitud igual en un archivo `SOLICITUDES-PENDIENTES.md` en la raíz del proyecto (creálo si no existe, agregá una entrada con fecha, título, detalle y contexto) y avisale a Diego que se la reenvíe a Matías por otro medio.
5. **Seguí con lo que SÍ se puede hacer del pedido.** No te quedes trabado esperando que el Hub implemente la solicitud — avanzá con la parte posible y dejá anotado qué falta.
6. **Seguimiento:** al arrancar una sesión (o cuando Diego pregunte qué pasó con un pedido), llamá `misSolicitudes()` y si alguna pasó a `hecha` o `rechazada`, contale a Diego en simple qué respondió Matías.

## Comandos

- `npm install` — instala las dependencias (una sola vez, o cuando cambie `package.json`).
- `npm run dev` — levanta el módulo en `http://localhost:5173` con recarga automática.
- `npm test` — corre los tests con vitest.
- `npm run build` — genera el build de producción en `dist/` (correlo antes de dar por cerrada una entrega grande, para confirmar que compila limpio).

**Definition of done** de cualquier tarea: tests verdes (`npm test` sin fallas) + módulo corriendo (`npm run dev` sin errores en consola) + Diego vio el resultado funcionando en el navegador.

## Referencia de la API del Hub


El Hub KOMUK centraliza el catálogo de productos personalizables de la empresa: bandeja de aprobación de proveedores, ficha de cada producto, técnicas de estampado y cotizador de precios. Cualquier módulo externo (una landing, un script, otra app) puede pegarle a esta API por HTTP para leer o modificar esos datos — no hace falta compartir base de datos ni código.

### Autenticación

Todos los endpoints (menos `/llms.txt` y `/api/openapi.json`) requieren el header `X-API-Key` con la key de demo:

```
X-API-Key: demo-komuk-2026
```

Sin el header, o con un valor incorrecto, la API responde `401` con el formato de error de más abajo.

### CORS

La API tiene CORS abierto (`Access-Control-Allow-Origin: *`): funciona desde cualquier origen, incluyendo páginas abiertas directamente como `file://` sin servidor. No usa cookies ni sesiones — toda la autenticación va en el header `X-API-Key` de cada request, así que no hay que preocuparse por credentials ni por el modo del fetch.

### Formato de error

Los errores siempre tienen esta forma (`code` es estable y sirve para manejar el caso en código; `message` es para mostrar o loguear; `details` aparece solo en errores de validación):

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Falta o es inválido el header X-API-Key. Usá la key de demo: demo-komuk-2026. Documentación en /docs."
  }
}
```

Códigos posibles: `unauthorized` (401), `not_found` (404), `conflict` (409), `validation_error` (400), `internal` (500).

### Listas

Los endpoints que devuelven varios elementos responden `{ total, items }`, donde `items` es el array y `total` su longitud.

### Flujo típico

1. Listar pendientes de aprobación:

```
GET http://localhost:3000/api/v1/productos?estado=pendiente
X-API-Key: demo-komuk-2026
```

2. Aprobar uno, asignando depósito, técnica e imágenes por canal:

```
POST http://localhost:3000/api/v1/productos/p01/aprobar
X-API-Key: demo-komuk-2026
Content-Type: application/json

{
  "deposito": "G1",
  "tecnicaId": "t1",
  "imagenesPorCanal": {
    "web": [
      "img1",
      "img2",
      "img3"
    ],
    "ml": [
      "img1",
      "img2"
    ],
    "tn": [
      "img1",
      "img2",
      "img3"
    ]
  }
}
```

3. Cotizar precio de venta para una cantidad de unidades (respuesta con desglose completo):

```
POST http://localhost:3000/api/v1/cotizaciones
X-API-Key: demo-komuk-2026
Content-Type: application/json

{
  "productoId": "p01",
  "tecnicaId": "t1",
  "cantidad": 100
}
```

Respuesta:

```json
{
  "producto": {
    "id": "p01",
    "nombre": "Lapicera plástica Bit",
    "sku": "ZEC-LAP-001"
  },
  "tecnica": {
    "id": "t1",
    "nombre": "Serigrafía 1 color"
  },
  "cantidad": 100,
  "desglose": [
    {
      "concepto": "Costo del producto",
      "montoUnitario": 780
    },
    {
      "concepto": "Envío (2%)",
      "montoUnitario": 15.6
    },
    {
      "concepto": "Serigrafía 1 color (variable por unidad)",
      "montoUnitario": 350
    },
    {
      "concepto": "Costo fijo prorrateado (15000 ÷ 100)",
      "montoUnitario": 150
    },
    {
      "concepto": "Ganancia (markup 35%)",
      "montoUnitario": 453.46
    }
  ],
  "subtotalUnitario": 1295.6,
  "precioUnitario": 1749.06,
  "totalPedido": 174906,
  "parametros": {
    "porcentajeEnvio": 0.02,
    "markup": 0.35
  }
}
```

4. Publicar el producto ya aprobado en Mercado Libre:

```
POST http://localhost:3000/api/v1/productos/p01/publicar-ml
X-API-Key: demo-komuk-2026
```

### Armar un presupuesto para un cliente

Flujo corto para un módulo que guarda presupuestos de clientes reales (ej. un cotizador standalone):

1. Crear el presupuesto para una empresa (nace en estado 'borrador', sin líneas):

```
POST http://localhost:3000/api/v1/presupuestos
X-API-Key: demo-komuk-2026
Content-Type: application/json

{
  "empresaId": "e04",
  "contactoId": "c07",
  "titulo": "Kit ferias de vino 2026"
}
```

Respuesta:

```json
{
  "id": "pr7x9k2m1a3",
  "empresaId": "e04",
  "contactoId": "c07",
  "titulo": "Kit ferias de vino 2026",
  "estado": "borrador",
  "lineas": [],
  "total": 0,
  "creadoEn": "2026-07-10T12:10:00.000Z"
}
```

2. Agregar una línea: el Hub cotiza al momento y congela el precio en la línea (snapshot — si después cambian costos o precios, esta línea no se mueve):

```
POST http://localhost:3000/api/v1/presupuestos/pr7x9k2m1a3/lineas
X-API-Key: demo-komuk-2026
Content-Type: application/json

{
  "productoId": "p13",
  "tecnicaId": "t5",
  "cantidad": 80
}
```

Respuesta (presupuesto actualizado):

```json
{
  "id": "pr7x9k2m1a3",
  "empresaId": "e04",
  "contactoId": "c07",
  "titulo": "Kit ferias de vino 2026",
  "estado": "borrador",
  "lineas": [
    {
      "id": "l1",
      "productoId": "p13",
      "productoNombre": "Termo boca ancha 500 ml",
      "tecnicaId": "t5",
      "tecnicaNombre": "Grabado láser",
      "cantidad": 80,
      "precioUnitario": 29733.75,
      "totalLinea": 2378700
    }
  ],
  "total": 2378700,
  "creadoEn": "2026-07-10T12:10:00.000Z"
}
```

3. Ver el presupuesto con su desglose y total:

```
GET http://localhost:3000/api/v1/presupuestos/pr7x9k2m1a3
X-API-Key: demo-komuk-2026
```

4. Marcarlo como enviado:

```
PUT http://localhost:3000/api/v1/presupuestos/pr7x9k2m1a3
X-API-Key: demo-komuk-2026
Content-Type: application/json

{
  "estado": "enviado"
}
```

Respuesta:

```json
{
  "id": "pr7x9k2m1a3",
  "empresaId": "e04",
  "contactoId": "c07",
  "titulo": "Kit ferias de vino 2026",
  "estado": "enviado",
  "lineas": [
    {
      "id": "l1",
      "productoId": "p13",
      "productoNombre": "Termo boca ancha 500 ml",
      "tecnicaId": "t5",
      "tecnicaNombre": "Grabado láser",
      "cantidad": 80,
      "precioUnitario": 29733.75,
      "totalLinea": 2378700
    }
  ],
  "total": 2378700,
  "creadoEn": "2026-07-10T12:10:00.000Z"
}
```

### Endpoints

#### GET http://localhost:3000/api/v1/productos

Lista productos con filtros opcionales.

Devuelve todos los productos del Hub (pendientes, aprobados y en lista negra). Se puede filtrar por proveedor, estado, canal, depósito o texto libre. Sin filtros, trae el catálogo completo.

Query params:

- `proveedor`: Nombre exacto del proveedor (ej. "Zecat"), case-insensitive.
- `estado`: "pendiente" | "aprobado" | "lista_negra".
- `canal`: "web" | "ml" | "tn" — solo productos publicados en ese canal.
- `deposito`: "G1" | "G2".
- `q`: Texto libre: busca en nombre y SKU.

Respuesta de ejemplo:

```json
{
  "total": 1,
  "items": [
    {
      "id": "p01",
      "nombre": "Lapicera plástica Bit",
      "sku": "ZEC-LAP-001",
      "categoria": "Escritura",
      "proveedor": "Zecat",
      "costo": 780,
      "stockProveedor": 12400,
      "imagenes": [
        {
          "id": "img1",
          "etiqueta": "Frente",
          "url": "https://placehold.co/600x600/E9F4F0/0F6E56/png?text=Lapicera+pl%C3%A1stica+Bit"
        },
        {
          "id": "img2",
          "etiqueta": "Dorso",
          "url": "https://placehold.co/600x600/D2E8E1/094637/png?text=Lapicera+pl%C3%A1stica+Bit+(dorso)"
        },
        {
          "id": "img3",
          "etiqueta": "Detalle",
          "url": "https://placehold.co/600x600/F1F5F9/475569/png?text=Lapicera+pl%C3%A1stica+Bit+(detalle)"
        }
      ],
      "variantes": [
        {
          "color": "Azul",
          "stock": 3100
        },
        {
          "color": "Negro",
          "stock": 3100
        },
        {
          "color": "Rojo",
          "stock": 3100
        },
        {
          "color": "Verde",
          "stock": 3100
        }
      ],
      "estado": "pendiente",
      "imagenesPorCanal": {
        "web": [],
        "ml": [],
        "tn": []
      },
      "publicadoEn": {
        "web": false,
        "ml": false,
        "tn": false
      },
      "publicacionML": "no_publicado"
    }
  ]
}
```

#### GET http://localhost:3000/api/v1/productos/{id}

Detalle de un producto por id.

Devuelve el producto completo (imágenes, variantes, estado, canales) o 404 si el id no existe.

Respuesta de ejemplo:

```json
{
  "id": "p01",
  "nombre": "Lapicera plástica Bit",
  "sku": "ZEC-LAP-001",
  "categoria": "Escritura",
  "proveedor": "Zecat",
  "costo": 780,
  "stockProveedor": 12400,
  "imagenes": [
    {
      "id": "img1",
      "etiqueta": "Frente",
      "url": "https://placehold.co/600x600/E9F4F0/0F6E56/png?text=Lapicera+pl%C3%A1stica+Bit"
    },
    {
      "id": "img2",
      "etiqueta": "Dorso",
      "url": "https://placehold.co/600x600/D2E8E1/094637/png?text=Lapicera+pl%C3%A1stica+Bit+(dorso)"
    },
    {
      "id": "img3",
      "etiqueta": "Detalle",
      "url": "https://placehold.co/600x600/F1F5F9/475569/png?text=Lapicera+pl%C3%A1stica+Bit+(detalle)"
    }
  ],
  "variantes": [
    {
      "color": "Azul",
      "stock": 3100
    },
    {
      "color": "Negro",
      "stock": 3100
    },
    {
      "color": "Rojo",
      "stock": 3100
    },
    {
      "color": "Verde",
      "stock": 3100
    }
  ],
  "estado": "pendiente",
  "imagenesPorCanal": {
    "web": [],
    "ml": [],
    "tn": []
  },
  "publicadoEn": {
    "web": false,
    "ml": false,
    "tn": false
  },
  "publicacionML": "no_publicado"
}
```

#### POST http://localhost:3000/api/v1/productos/{id}/aprobar

Aprueba un producto pendiente: asigna depósito, técnica e imágenes por canal.

Mueve el producto de 'pendiente' a 'aprobado'. Requiere depósito (G1|G2), la técnica de estampado a usar y qué imágenes quedan habilitadas en cada canal (web, ml, tn). Si el producto ya no está pendiente, responde 409 (conflict).

Body de ejemplo:

```json
{
  "deposito": "G1",
  "tecnicaId": "t1",
  "imagenesPorCanal": {
    "web": [
      "img1",
      "img2",
      "img3"
    ],
    "ml": [
      "img1",
      "img2"
    ],
    "tn": [
      "img1",
      "img2",
      "img3"
    ]
  }
}
```

Respuesta de ejemplo:

```json
{
  "id": "p01",
  "nombre": "Lapicera plástica Bit",
  "sku": "ZEC-LAP-001",
  "categoria": "Escritura",
  "proveedor": "Zecat",
  "costo": 780,
  "stockProveedor": 12400,
  "imagenes": [
    {
      "id": "img1",
      "etiqueta": "Frente",
      "url": "https://placehold.co/600x600/E9F4F0/0F6E56/png?text=Lapicera+pl%C3%A1stica+Bit"
    },
    {
      "id": "img2",
      "etiqueta": "Dorso",
      "url": "https://placehold.co/600x600/D2E8E1/094637/png?text=Lapicera+pl%C3%A1stica+Bit+(dorso)"
    },
    {
      "id": "img3",
      "etiqueta": "Detalle",
      "url": "https://placehold.co/600x600/F1F5F9/475569/png?text=Lapicera+pl%C3%A1stica+Bit+(detalle)"
    }
  ],
  "variantes": [
    {
      "color": "Azul",
      "stock": 3100
    },
    {
      "color": "Negro",
      "stock": 3100
    },
    {
      "color": "Rojo",
      "stock": 3100
    },
    {
      "color": "Verde",
      "stock": 3100
    }
  ],
  "estado": "aprobado",
  "imagenesPorCanal": {
    "web": [
      "img1",
      "img2",
      "img3"
    ],
    "ml": [
      "img1",
      "img2"
    ],
    "tn": [
      "img1",
      "img2",
      "img3"
    ]
  },
  "publicadoEn": {
    "web": false,
    "ml": false,
    "tn": false
  },
  "publicacionML": "no_publicado",
  "deposito": "G1",
  "tecnicaId": "t1"
}
```

#### POST http://localhost:3000/api/v1/productos/{id}/lista-negra

Manda un producto a lista negra (lo descarta del flujo de aprobación).

Cambia el estado del producto a 'lista_negra'. No requiere body. Idempotente.

Respuesta de ejemplo:

```json
{
  "id": "p01",
  "nombre": "Lapicera plástica Bit",
  "sku": "ZEC-LAP-001",
  "categoria": "Escritura",
  "proveedor": "Zecat",
  "costo": 780,
  "stockProveedor": 12400,
  "imagenes": [
    {
      "id": "img1",
      "etiqueta": "Frente",
      "url": "https://placehold.co/600x600/E9F4F0/0F6E56/png?text=Lapicera+pl%C3%A1stica+Bit"
    },
    {
      "id": "img2",
      "etiqueta": "Dorso",
      "url": "https://placehold.co/600x600/D2E8E1/094637/png?text=Lapicera+pl%C3%A1stica+Bit+(dorso)"
    },
    {
      "id": "img3",
      "etiqueta": "Detalle",
      "url": "https://placehold.co/600x600/F1F5F9/475569/png?text=Lapicera+pl%C3%A1stica+Bit+(detalle)"
    }
  ],
  "variantes": [
    {
      "color": "Azul",
      "stock": 3100
    },
    {
      "color": "Negro",
      "stock": 3100
    },
    {
      "color": "Rojo",
      "stock": 3100
    },
    {
      "color": "Verde",
      "stock": 3100
    }
  ],
  "estado": "lista_negra",
  "imagenesPorCanal": {
    "web": [],
    "ml": [],
    "tn": []
  },
  "publicadoEn": {
    "web": false,
    "ml": false,
    "tn": false
  },
  "publicacionML": "no_publicado"
}
```

#### POST http://localhost:3000/api/v1/productos/{id}/canales

Prende o apaga la publicación de un producto en un canal puntual.

Actualiza `publicadoEn[canal]`. Si el canal es 'ml', también sincroniza `publicacionML` ('publicado' o 'no_publicado').

Body de ejemplo:

```json
{
  "canal": "ml",
  "publicado": true
}
```

Respuesta de ejemplo:

```json
{
  "id": "p11",
  "nombre": "Botella deportiva PET 600 ml",
  "sku": "ZEC-BOT-208",
  "categoria": "Botellas y termos",
  "proveedor": "Zecat",
  "costo": 3100,
  "stockProveedor": 7200,
  "imagenes": [
    {
      "id": "img1",
      "etiqueta": "Frente",
      "url": "https://placehold.co/600x600/E9F4F0/0F6E56/png?text=Botella+deportiva+PET+600+ml"
    },
    {
      "id": "img2",
      "etiqueta": "Dorso",
      "url": "https://placehold.co/600x600/D2E8E1/094637/png?text=Botella+deportiva+PET+600+ml+(dorso)"
    },
    {
      "id": "img3",
      "etiqueta": "Detalle",
      "url": "https://placehold.co/600x600/F1F5F9/475569/png?text=Botella+deportiva+PET+600+ml+(detalle)"
    }
  ],
  "estado": "aprobado",
  "deposito": "G1",
  "tecnicaId": "t1",
  "imagenesPorCanal": {
    "web": [
      "img1",
      "img2",
      "img3"
    ],
    "ml": [
      "img1",
      "img2"
    ],
    "tn": [
      "img1",
      "img2",
      "img3"
    ]
  },
  "publicadoEn": {
    "web": true,
    "ml": true,
    "tn": false
  },
  "publicacionML": "publicado"
}
```

#### POST http://localhost:3000/api/v1/productos/{id}/publicar-ml

Publica un producto aprobado en Mercado Libre.

Marca `publicacionML: 'publicado'` y `publicadoEn.ml: true`. Solo funciona sobre productos con estado 'aprobado'; si no, responde 409.

Respuesta de ejemplo:

```json
{
  "id": "p11",
  "nombre": "Botella deportiva PET 600 ml",
  "sku": "ZEC-BOT-208",
  "categoria": "Botellas y termos",
  "proveedor": "Zecat",
  "costo": 3100,
  "stockProveedor": 7200,
  "imagenes": [
    {
      "id": "img1",
      "etiqueta": "Frente",
      "url": "https://placehold.co/600x600/E9F4F0/0F6E56/png?text=Botella+deportiva+PET+600+ml"
    },
    {
      "id": "img2",
      "etiqueta": "Dorso",
      "url": "https://placehold.co/600x600/D2E8E1/094637/png?text=Botella+deportiva+PET+600+ml+(dorso)"
    },
    {
      "id": "img3",
      "etiqueta": "Detalle",
      "url": "https://placehold.co/600x600/F1F5F9/475569/png?text=Botella+deportiva+PET+600+ml+(detalle)"
    }
  ],
  "estado": "aprobado",
  "deposito": "G1",
  "tecnicaId": "t1",
  "imagenesPorCanal": {
    "web": [
      "img1",
      "img2",
      "img3"
    ],
    "ml": [
      "img1",
      "img2"
    ],
    "tn": [
      "img1",
      "img2",
      "img3"
    ]
  },
  "publicadoEn": {
    "web": true,
    "ml": true,
    "tn": false
  },
  "publicacionML": "publicado"
}
```

#### GET http://localhost:3000/api/v1/tecnicas

Lista todas las técnicas de estampado con sus costos.

Cada técnica tiene un costo fijo por trabajo (se prorratea entre las unidades) y un costo variable por unidad.

Respuesta de ejemplo:

```json
{
  "total": 8,
  "items": [
    {
      "id": "t1",
      "nombre": "Serigrafía 1 color",
      "costoFijo": 15000,
      "costoVariable": 350
    },
    {
      "id": "t2",
      "nombre": "Serigrafía 2 colores",
      "costoFijo": 24000,
      "costoVariable": 620
    },
    {
      "id": "t3",
      "nombre": "Bordado",
      "costoFijo": 18000,
      "costoVariable": 950
    },
    {
      "id": "t4",
      "nombre": "Tampografía",
      "costoFijo": 12000,
      "costoVariable": 280
    },
    {
      "id": "t5",
      "nombre": "Grabado láser",
      "costoFijo": 10000,
      "costoVariable": 480
    },
    {
      "id": "t6",
      "nombre": "Vinilo textil",
      "costoFijo": 8000,
      "costoVariable": 720
    },
    {
      "id": "t7",
      "nombre": "Sublimación",
      "costoFijo": 6000,
      "costoVariable": 560
    },
    {
      "id": "t8",
      "nombre": "Transfer digital",
      "costoFijo": 9000,
      "costoVariable": 650
    }
  ]
}
```

#### POST http://localhost:3000/api/v1/tecnicas

Crea una técnica nueva.

Alta de técnica. El id se genera del lado del servidor (no se envía en el body).

Body de ejemplo:

```json
{
  "nombre": "Sublimación XL",
  "costoFijo": 7000,
  "costoVariable": 600
}
```

Respuesta de ejemplo:

```json
{
  "id": "tlk3j2x9",
  "nombre": "Sublimación XL",
  "costoFijo": 7000,
  "costoVariable": 600
}
```

#### PUT http://localhost:3000/api/v1/tecnicas/{id}

Actualiza nombre y costos de una técnica existente.

Reemplaza nombre, costoFijo y costoVariable de la técnica. 404 si el id no existe.

Body de ejemplo:

```json
{
  "nombre": "Serigrafía 1 color",
  "costoFijo": 16000,
  "costoVariable": 380
}
```

Respuesta de ejemplo:

```json
{
  "id": "t1",
  "nombre": "Serigrafía 1 color",
  "costoFijo": 16000,
  "costoVariable": 380
}
```

#### DELETE http://localhost:3000/api/v1/tecnicas/{id}

Elimina una técnica.

Borra la técnica del catálogo. 404 si el id no existe. No valida si hay productos que la referencian.

Respuesta de ejemplo:

```json
{
  "eliminado": "t8"
}
```

#### POST http://localhost:3000/api/v1/cotizaciones

Calcula el precio de venta de un producto con una técnica y cantidad dadas.

Recibe productoId, tecnicaId y cantidad; devuelve el desglose completo (costo, envío, variable de la técnica, fijo prorrateado, ganancia) y el precio unitario y total. No persiste nada — es un cálculo puro.

Body de ejemplo:

```json
{
  "productoId": "p09",
  "tecnicaId": "t7",
  "cantidad": 100
}
```

Respuesta de ejemplo:

```json
{
  "producto": {
    "id": "p09",
    "nombre": "Taza cerámica 330 ml",
    "sku": "ZEC-TAZ-021"
  },
  "tecnica": {
    "id": "t7",
    "nombre": "Sublimación"
  },
  "cantidad": 100,
  "desglose": [
    {
      "concepto": "Costo del producto",
      "montoUnitario": 4200
    },
    {
      "concepto": "Envío (2%)",
      "montoUnitario": 84
    },
    {
      "concepto": "Sublimación (variable por unidad)",
      "montoUnitario": 560
    },
    {
      "concepto": "Costo fijo prorrateado (6000 ÷ 100)",
      "montoUnitario": 60
    },
    {
      "concepto": "Ganancia (markup 35%)",
      "montoUnitario": 1716.4
    }
  ],
  "subtotalUnitario": 4904,
  "precioUnitario": 6620.4,
  "totalPedido": 662040,
  "parametros": {
    "porcentajeEnvio": 0.02,
    "markup": 0.35
  }
}
```

#### GET http://localhost:3000/api/v1/solicitudes

Lista las solicitudes de features que los módulos le hicieron al Hub.

Devuelve todas las solicitudes registradas, ordenadas de más reciente a más antigua. Se puede filtrar por módulo (para que cada módulo consulte solo sus propios pedidos) o por estado. Sirve tanto para que el equipo del Hub revise qué les están pidiendo los módulos externos, como para que un módulo haga seguimiento de sus propias solicitudes.

Query params:

- `modulo`: Slug del módulo que generó la solicitud (ej. "vidriera-web").
- `estado`: "nueva" | "en_analisis" | "hecha" | "rechazada".

Respuesta de ejemplo:

```json
{
  "total": 1,
  "items": [
    {
      "id": "s1a2b3c4",
      "modulo": "vidriera-web",
      "titulo": "Ver pedidos de clientes",
      "detalle": "Necesito un endpoint GET /pedidos con estado y total por cliente.",
      "contexto": "Diego pidió: quiero ver qué me compró cada cliente",
      "estado": "hecha",
      "creadaEn": "2026-07-09T14:32:00.000Z",
      "respuesta": "Ya está disponible: usá GET /api/v1/productos?canal=ml para ese caso."
    }
  ]
}
```

#### POST http://localhost:3000/api/v1/solicitudes

Registra que un módulo necesita algo que la API todavía no ofrece.

Usalo cuando el usuario te pide algo que la API no soporta: en vez de inventar una respuesta o simular datos, registrá la solicitud acá. Requiere modulo (nombre del módulo que la genera), titulo y detalle; contexto es opcional y sirve para citar el pedido original del usuario.

Body de ejemplo:

```json
{
  "modulo": "vidriera-web",
  "titulo": "Ver pedidos de clientes",
  "detalle": "Necesito un endpoint GET /pedidos con estado y total por cliente.",
  "contexto": "Diego pidió: quiero ver qué me compró cada cliente"
}
```

Respuesta de ejemplo:

```json
{
  "id": "s1a2b3c4",
  "modulo": "vidriera-web",
  "titulo": "Ver pedidos de clientes",
  "detalle": "Necesito un endpoint GET /pedidos con estado y total por cliente.",
  "contexto": "Diego pidió: quiero ver qué me compró cada cliente",
  "estado": "nueva",
  "creadaEn": "2026-07-09T14:32:00.000Z"
}
```

#### PUT http://localhost:3000/api/v1/solicitudes/{id}

Actualiza el estado de una solicitud y, opcionalmente, deja una respuesta.

Usalo para mover una solicitud a 'en_analisis', 'hecha' o 'rechazada'. `respuesta` es opcional (hasta 2000 caracteres) y es el mensaje que el módulo le puede mostrar al usuario explicando qué se resolvió. 404 si el id no existe.

Body de ejemplo:

```json
{
  "estado": "hecha",
  "respuesta": "Ya está disponible: usá GET /api/v1/productos?canal=ml para ese caso."
}
```

Respuesta de ejemplo:

```json
{
  "id": "s1a2b3c4",
  "modulo": "vidriera-web",
  "titulo": "Ver pedidos de clientes",
  "detalle": "Necesito un endpoint GET /pedidos con estado y total por cliente.",
  "contexto": "Diego pidió: quiero ver qué me compró cada cliente",
  "estado": "hecha",
  "creadaEn": "2026-07-09T14:32:00.000Z",
  "respuesta": "Ya está disponible: usá GET /api/v1/productos?canal=ml para ese caso."
}
```

#### GET http://localhost:3000/api/v1/modulos

Lista los módulos externos creados desde el Hub.

Devuelve el inventario de módulos registrados en el Hub. Cada módulo que se crea automáticamente aparece aquí con su slug, nombre, tipo, descripción y fecha de creación. Útil para que otros módulos descubran qué otros módulos existen en el ecosistema.

Respuesta de ejemplo:

```json
{
  "total": 1,
  "items": [
    {
      "slug": "vidriera-web",
      "nombre": "Vidriera Web",
      "tipo": "vidriera",
      "descripcion": "Catálogo con fotos para clientes",
      "creadoEn": "2026-07-10T14:00:00.000Z"
    }
  ]
}
```

#### GET http://localhost:3000/api/v1/empresas

Lista las empresas clientes registradas en el CRM.

Devuelve las empresas guardadas (razón social, CUIT, rubro, ciudad y notas). El parámetro `q` busca coincidencias parciales en nombre, CUIT o ciudad.

Query params:

- `q`: Texto libre: busca en nombre, CUIT y ciudad.

Respuesta de ejemplo:

```json
{
  "total": 6,
  "items": [
    {
      "id": "e01",
      "nombre": "Colegio San Martín",
      "cuit": "30-71234567-8",
      "rubro": "Educación",
      "ciudad": "San Miguel de Tucumán",
      "notas": "Pide remeras para el acto del 9 de julio y egresados todos los años. Paga a 30 días.",
      "creadaEn": "2026-05-12T13:20:00.000Z"
    },
    {
      "id": "e02",
      "nombre": "Eventos Sur Producciones",
      "cuit": "30-70987654-2",
      "rubro": "Organización de eventos",
      "ciudad": "CABA",
      "notas": "Agencia de eventos corporativos. Compra grandes volúmenes con poco margen de tiempo.",
      "creadaEn": "2026-05-20T10:05:00.000Z"
    },
    {
      "id": "e03",
      "nombre": "NubeTech SA",
      "cuit": "30-71555444-1",
      "rubro": "Software / Tecnología",
      "ciudad": "CABA",
      "notas": "Regalos de onboarding y kits de fin de año para el equipo. Contacto directo con Marketing.",
      "creadaEn": "2026-06-02T09:40:00.000Z"
    },
    {
      "id": "e04",
      "nombre": "Bodega Los Cardones",
      "cuit": "30-70222333-5",
      "rubro": "Vitivinícola",
      "ciudad": "Luján de Cuyo, Mendoza",
      "notas": "Merchandising para visitas guiadas y ferias del vino. Prefiere productos premium.",
      "creadaEn": "2026-06-10T15:15:00.000Z"
    },
    {
      "id": "e05",
      "nombre": "Club Atlético Gimnasia y Tiro",
      "cuit": "30-54666777-9",
      "rubro": "Club deportivo",
      "ciudad": "Salta",
      "notas": "Indumentaria para las inferiores y souvenirs para socios. Compra estacional (marzo y agosto).",
      "creadaEn": "2026-06-18T11:30:00.000Z"
    },
    {
      "id": "e06",
      "nombre": "Municipalidad de Tafí Viejo",
      "cuit": "30-63888999-4",
      "rubro": "Sector público",
      "ciudad": "Tafí Viejo, Tucumán",
      "notas": "Requiere factura A y expediente de compra. Tiempos de aprobación largos.",
      "creadaEn": "2026-06-25T08:50:00.000Z"
    }
  ]
}
```

#### POST http://localhost:3000/api/v1/empresas

Da de alta una empresa cliente.

Crea una empresa nueva. Solo `nombre` es obligatorio; `cuit`, `rubro`, `ciudad` y `notas` son opcionales. El id y `creadaEn` los genera el servidor.

Body de ejemplo:

```json
{
  "nombre": "Vidriera Norte SRL",
  "cuit": "30-71999888-3",
  "rubro": "Retail",
  "ciudad": "Rosario",
  "notas": "Nuevo cliente derivado por Diego."
}
```

Respuesta de ejemplo:

```json
{
  "id": "e1qk3f8x2p1",
  "nombre": "Vidriera Norte SRL",
  "cuit": "30-71999888-3",
  "rubro": "Retail",
  "ciudad": "Rosario",
  "notas": "Nuevo cliente derivado por Diego.",
  "creadaEn": "2026-07-10T12:00:00.000Z"
}
```

#### GET http://localhost:3000/api/v1/empresas/{id}

Detalle de una empresa por id.

Devuelve la empresa completa. 404 si el id no existe.

Respuesta de ejemplo:

```json
{
  "id": "e01",
  "nombre": "Colegio San Martín",
  "cuit": "30-71234567-8",
  "rubro": "Educación",
  "ciudad": "San Miguel de Tucumán",
  "notas": "Pide remeras para el acto del 9 de julio y egresados todos los años. Paga a 30 días.",
  "creadaEn": "2026-05-12T13:20:00.000Z"
}
```

#### PUT http://localhost:3000/api/v1/empresas/{id}

Actualiza los datos de una empresa existente.

Reemplaza nombre, CUIT, rubro, ciudad y notas de la empresa (mismos campos que el alta). 404 si el id no existe.

Body de ejemplo:

```json
{
  "nombre": "Colegio San Martín",
  "cuit": "30-71234567-8",
  "rubro": "Educación",
  "ciudad": "San Miguel de Tucumán",
  "notas": "Pide remeras para el acto y egresados todos los años. Ahora también uniformes de educación física."
}
```

Respuesta de ejemplo:

```json
{
  "id": "e01",
  "nombre": "Colegio San Martín",
  "cuit": "30-71234567-8",
  "rubro": "Educación",
  "ciudad": "San Miguel de Tucumán",
  "notas": "Pide remeras para el acto y egresados todos los años. Ahora también uniformes de educación física.",
  "creadaEn": "2026-05-12T13:20:00.000Z"
}
```

#### DELETE http://localhost:3000/api/v1/empresas/{id}

Elimina una empresa.

Borra la empresa. 409 si todavía tiene contactos o presupuestos asociados (hay que borrarlos primero). 404 si el id no existe.

Respuesta de ejemplo:

```json
{
  "eliminado": "e06"
}
```

#### GET http://localhost:3000/api/v1/contactos

Lista contactos, opcionalmente filtrados por empresa.

Devuelve los contactos (nombre, cargo, email, teléfono) de todas las empresas o, con `?empresa=`, solo los de una empresa puntual.

Query params:

- `empresa`: Id de la empresa (ej. "e01"). Sin este filtro trae todos los contactos.

Respuesta de ejemplo:

```json
{
  "total": 2,
  "items": [
    {
      "id": "c01",
      "empresaId": "e01",
      "nombre": "Marisa Funes",
      "cargo": "Compras",
      "email": "compras@colegiosanmartin.edu.ar",
      "telefono": "381-4551122"
    },
    {
      "id": "c02",
      "empresaId": "e01",
      "nombre": "Hugo Ávila",
      "cargo": "Dirección",
      "email": "direccion@colegiosanmartin.edu.ar"
    }
  ]
}
```

#### POST http://localhost:3000/api/v1/contactos

Da de alta un contacto dentro de una empresa.

empresaId es obligatorio y debe existir (404 si no). nombre es obligatorio; cargo, email y telefono son opcionales. El id lo genera el servidor.

Body de ejemplo:

```json
{
  "empresaId": "e04",
  "nombre": "Valentina Ríos",
  "cargo": "Marketing",
  "email": "valentina@bodegaloscardones.com.ar"
}
```

Respuesta de ejemplo:

```json
{
  "id": "c1qk3f8x2p1",
  "empresaId": "e04",
  "nombre": "Valentina Ríos",
  "cargo": "Marketing",
  "email": "valentina@bodegaloscardones.com.ar"
}
```

#### PUT http://localhost:3000/api/v1/contactos/{id}

Actualiza un contacto existente.

Reemplaza nombre, cargo, email y teléfono. No permite cambiar `empresaId` (para eso hay que borrar y recrear el contacto en la otra empresa). 404 si el id no existe.

Body de ejemplo:

```json
{
  "nombre": "Marisa Funes",
  "cargo": "Compras",
  "email": "compras@colegiosanmartin.edu.ar",
  "telefono": "381-4551199"
}
```

Respuesta de ejemplo:

```json
{
  "id": "c01",
  "empresaId": "e01",
  "nombre": "Marisa Funes",
  "cargo": "Compras",
  "email": "compras@colegiosanmartin.edu.ar",
  "telefono": "381-4551199"
}
```

#### DELETE http://localhost:3000/api/v1/contactos/{id}

Elimina un contacto.

Borra el contacto. 409 si algún presupuesto lo tiene asignado como `contactoId` (primero hay que sacarlo de ahí). 404 si el id no existe.

Respuesta de ejemplo:

```json
{
  "eliminado": "c02"
}
```

#### GET http://localhost:3000/api/v1/presupuestos

Lista presupuestos, con filtros por empresa y estado.

Devuelve los presupuestos (con sus líneas y total) ordenados del más reciente al más antiguo. Se puede filtrar por empresa, por estado, o combinar ambos.

Query params:

- `empresa`: Id de la empresa (ej. "e01").
- `estado`: "borrador" | "enviado" | "aceptado" | "rechazado".

Respuesta de ejemplo:

```json
{
  "total": 3,
  "items": [
    {
      "id": "pr03",
      "empresaId": "e03",
      "contactoId": "c06",
      "titulo": "Kit onboarding + fin de año",
      "estado": "aceptado",
      "lineas": [
        {
          "id": "l1",
          "productoId": "p13",
          "productoNombre": "Termo boca ancha 500 ml",
          "tecnicaId": "t5",
          "tecnicaNombre": "Grabado láser",
          "cantidad": 150,
          "precioUnitario": 29655,
          "totalLinea": 4448250
        },
        {
          "id": "l2",
          "productoId": "p12",
          "productoNombre": "Cuaderno espiral A4 tapa dura",
          "tecnicaId": "t3",
          "tecnicaNombre": "Bordado",
          "cantidad": 150,
          "precioUnitario": 9155.7,
          "totalLinea": 1373355
        }
      ],
      "total": 5821605,
      "creadoEn": "2026-07-03T16:45:00.000Z"
    },
    {
      "id": "pr02",
      "empresaId": "e02",
      "contactoId": "c03",
      "titulo": "Kit lanzamiento producto — evento CABA",
      "estado": "enviado",
      "lineas": [
        {
          "id": "l1",
          "productoId": "p10",
          "productoNombre": "Lapicera plástica Eco (fibra de trigo)",
          "tecnicaId": "t4",
          "tecnicaNombre": "Tampografía",
          "cantidad": 500,
          "precioUnitario": 1539.54,
          "totalLinea": 769770
        },
        {
          "id": "l2",
          "productoId": "p19",
          "productoNombre": "Bolsa friselina 40x45 con manija",
          "tecnicaId": "t1",
          "tecnicaNombre": "Serigrafía 1 color",
          "cantidad": 300,
          "precioUnitario": 1848.15,
          "totalLinea": 554445
        },
        {
          "id": "l3",
          "productoId": "p24",
          "productoNombre": "Gorra trucker con red",
          "tecnicaId": "t6",
          "tecnicaNombre": "Vinilo textil",
          "cantidad": 100,
          "precioUnitario": 9617.4,
          "totalLinea": 961740
        }
      ],
      "total": 2285955,
      "creadoEn": "2026-07-01T09:30:00.000Z"
    },
    {
      "id": "pr01",
      "empresaId": "e01",
      "contactoId": "c01",
      "titulo": "Remeras acto 9 de julio",
      "estado": "borrador",
      "lineas": [
        {
          "id": "l1",
          "productoId": "p22",
          "productoNombre": "Remera oversize algodón pesado",
          "tecnicaId": "t1",
          "tecnicaNombre": "Serigrafía 1 color",
          "cantidad": 200,
          "precioUnitario": 11452.05,
          "totalLinea": 2290410
        }
      ],
      "total": 2290410,
      "creadoEn": "2026-06-28T14:00:00.000Z"
    }
  ]
}
```

#### POST http://localhost:3000/api/v1/presupuestos

Crea un presupuesto nuevo para una empresa, en estado borrador.

empresaId es obligatorio (404 si la empresa no existe). contactoId es opcional (404 si el contacto no existe, 409 si no pertenece a esa empresa). titulo es obligatorio. El presupuesto nace en estado 'borrador', sin líneas y con total 0; las líneas se agregan después con POST .../lineas.

Body de ejemplo:

```json
{
  "empresaId": "e04",
  "contactoId": "c07",
  "titulo": "Kit ferias de vino 2026"
}
```

Respuesta de ejemplo:

```json
{
  "id": "pr7x9k2m1a3",
  "empresaId": "e04",
  "contactoId": "c07",
  "titulo": "Kit ferias de vino 2026",
  "estado": "borrador",
  "lineas": [],
  "total": 0,
  "creadoEn": "2026-07-10T12:10:00.000Z"
}
```

#### GET http://localhost:3000/api/v1/presupuestos/{id}

Detalle de un presupuesto, con sus líneas.

Devuelve el presupuesto completo: empresa, contacto (si tiene), título, estado, cada línea (producto, técnica, cantidad, precio unitario y total snapshoteados) y el total general. 404 si el id no existe.

Respuesta de ejemplo:

```json
{
  "id": "pr01",
  "empresaId": "e01",
  "contactoId": "c01",
  "titulo": "Remeras acto 9 de julio",
  "estado": "borrador",
  "lineas": [
    {
      "id": "l1",
      "productoId": "p22",
      "productoNombre": "Remera oversize algodón pesado",
      "tecnicaId": "t1",
      "tecnicaNombre": "Serigrafía 1 color",
      "cantidad": 200,
      "precioUnitario": 11452.05,
      "totalLinea": 2290410
    }
  ],
  "total": 2290410,
  "creadoEn": "2026-06-28T14:00:00.000Z"
}
```

#### PUT http://localhost:3000/api/v1/presupuestos/{id}

Actualiza título, contacto o estado de un presupuesto.

Todos los campos son opcionales. `estado` puede moverse libremente a cualquiera de los cuatro valores, sin máquina de estados que lo restrinja. `contactoId` acepta `null` para sacar el contacto asignado, o un id de contacto (404 si no existe, 409 si no pertenece a la empresa del presupuesto). No permite cambiar `empresaId`. 404 si el presupuesto no existe.

Body de ejemplo:

```json
{
  "estado": "enviado"
}
```

Respuesta de ejemplo:

```json
{
  "id": "pr01",
  "empresaId": "e01",
  "contactoId": "c01",
  "titulo": "Remeras acto 9 de julio",
  "estado": "enviado",
  "lineas": [
    {
      "id": "l1",
      "productoId": "p22",
      "productoNombre": "Remera oversize algodón pesado",
      "tecnicaId": "t1",
      "tecnicaNombre": "Serigrafía 1 color",
      "cantidad": 200,
      "precioUnitario": 11452.05,
      "totalLinea": 2290410
    }
  ],
  "total": 2290410,
  "creadoEn": "2026-06-28T14:00:00.000Z"
}
```

#### DELETE http://localhost:3000/api/v1/presupuestos/{id}

Elimina un presupuesto.

Borra el presupuesto y todas sus líneas, sin restricciones de estado. 404 si el id no existe.

Respuesta de ejemplo:

```json
{
  "eliminado": "pr01"
}
```

#### POST http://localhost:3000/api/v1/presupuestos/{id}/lineas

Agrega una línea a un presupuesto en borrador, cotizando en el momento.

Recibe productoId, tecnicaId y cantidad (entero positivo). El Hub cotiza al momento con el mismo motor que /api/v1/cotizaciones y congela el precio en la línea: nombre de producto y técnica, precio unitario y total quedan snapshoteados, así que cambios posteriores en costos o precios no afectan esta línea. 404 si el producto o la técnica no existen. 409 si el presupuesto no está en estado 'borrador' (solo se editan borradores; hay que reabrirlo cambiando el estado si hace falta). Devuelve el presupuesto completo actualizado, con el total recalculado.

Body de ejemplo:

```json
{
  "productoId": "p01",
  "tecnicaId": "t1",
  "cantidad": 50
}
```

Respuesta de ejemplo:

```json
{
  "id": "pr01",
  "empresaId": "e01",
  "contactoId": "c01",
  "titulo": "Remeras acto 9 de julio",
  "estado": "borrador",
  "lineas": [
    {
      "id": "l1",
      "productoId": "p22",
      "productoNombre": "Remera oversize algodón pesado",
      "tecnicaId": "t1",
      "tecnicaNombre": "Serigrafía 1 color",
      "cantidad": 200,
      "precioUnitario": 11452.05,
      "totalLinea": 2290410
    },
    {
      "id": "l2",
      "productoId": "p01",
      "productoNombre": "Lapicera plástica Bit",
      "tecnicaId": "t1",
      "tecnicaNombre": "Serigrafía 1 color",
      "cantidad": 50,
      "precioUnitario": 1951.56,
      "totalLinea": 97578
    }
  ],
  "total": 2387988,
  "creadoEn": "2026-06-28T14:00:00.000Z"
}
```

#### DELETE http://localhost:3000/api/v1/presupuestos/{id}/lineas/{lineaId}

Quita una línea de un presupuesto en borrador.

409 si el presupuesto no está en estado 'borrador'. 404 si la línea no existe en ese presupuesto. Devuelve el presupuesto actualizado con el total recalculado.

Respuesta de ejemplo:

```json
{
  "id": "pr01",
  "empresaId": "e01",
  "contactoId": "c01",
  "titulo": "Remeras acto 9 de julio",
  "estado": "borrador",
  "lineas": [],
  "total": 0,
  "creadoEn": "2026-06-28T14:00:00.000Z"
}
```

#### POST http://localhost:3000/api/v1/reset

Reinicia la demo al estado inicial (8 pendientes, 17 aprobados, 8 técnicas, 6 empresas, 10 contactos y 3 presupuestos).

Borra todos los cambios hechos durante la demo y vuelve a cargar el seed original, incluidas las empresas, contactos y presupuestos del CRM. Pensado para dejar el Hub limpio antes de una nueva demo o prueba.

Respuesta de ejemplo:

```json
{
  "ok": true,
  "mensaje": "La demo volvió al estado inicial."
}
```

### ¿Y si te piden algo que la API no tiene?

Va a pasar: alguien te va a pedir algo que esta API todavía no resuelve. Ante eso:

1. No simules la respuesta con datos inventados — es peor que decir que no se puede.
2. Explicale al usuario en criollo qué es lo que falta, sin tecnicismos.
3. Registrá el pedido con `POST http://localhost:3000/api/v1/solicitudes` para que quede anotado:

```json
{
  "modulo": "mi-modulo",
  "titulo": "Título corto del pedido",
  "detalle": "Qué necesitás y para qué lo vas a usar.",
  "contexto": "Lo que te dijo el usuario, tal cual"
}
```

4. Seguí ayudando con lo que sí se puede hacer con la API tal como está — no te quedes trabado esperando que se implemente.
5. Consultá después `GET http://localhost:3000/api/v1/solicitudes?modulo=<tu-slug>` para ver si el pedido ya tiene respuesta, y contale al usuario en criollo qué te dijo.

---

Cualquier módulo (HTML standalone, script, app) puede consumir esta API con fetch; no hay cookies ni sesiones.