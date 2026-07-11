import { useEffect, useState } from "react";
import { listarProductos } from "./api.js";

export default function App() {
  const [q, setQ] = useState("");
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCargando(true);
      setError(null);
      listarProductos(q ? { q } : undefined)
        .then((data) => setProductos(data.items))
        .catch((e) => setError(e.message))
        .finally(() => setCargando(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div className="wrap">
      <header>
        <h1>Buscador de stock</h1>
        <p>Buscá un producto por nombre o SKU y mirá su stock.</p>
      </header>

      <input
        type="text"
        className="input"
        placeholder="Buscar por nombre o SKU..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {error && <div className="error">{error}</div>}
      {cargando && <p>Buscando...</p>}

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>SKU</th>
            <th>Stock proveedor</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.sku}</td>
              <td>{p.stockProveedor}</td>
              <td>{p.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!cargando && !error && productos.length === 0 && <p>No hay productos para mostrar.</p>}
    </div>
  );
}
