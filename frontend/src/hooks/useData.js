import { useState, useEffect, useCallback } from "react";

const BASE = "/api";

// Cache simple en memoria para no re-fetchear en cada render
const cache = {};

async function fetchJSON(url) {
  if (cache[url]) return cache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status} en ${url}`);
  const data = await res.json();
  cache[url] = data;
  return data;
}

// Hook para datos estáticos (stats, producción, departamentos, insights)
export function useData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchJSON(`${BASE}/stats`),
      fetchJSON(`${BASE}/produccion-mensual`),
      fetchJSON(`${BASE}/por-departamento`),
      fetchJSON(`${BASE}/insights`),
    ])
      .then(([stats, mensual, porDepto, insights]) => {
        setData({ stats, mensual, porDepto, insights });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// Hook para predicción dinámica — se llama manualmente
export function usePrediccion() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predecir = useCallback(async ({ departamento, tecnologia, meses }) => {
    setLoading(true);
    setResultado(null);
    setError(null);

    // Mínimo 1.5s para que la animación de carga se vea
    const [data] = await Promise.all([
      fetchJSON(
        `${BASE}/prediccion?departamento=${encodeURIComponent(departamento)}&tecnologia=${encodeURIComponent(tecnologia)}&meses=${meses}`,
      ),
      new Promise((r) => setTimeout(r, 1500)),
    ]);

    setResultado(data);
    setLoading(false);
  }, []);

  const limpiar = useCallback(() => {
    setResultado(null);
    setError(null);
    // Limpiar del cache para que el próximo fetch sea fresco
    Object.keys(cache).forEach((k) => {
      if (k.includes("/prediccion")) delete cache[k];
    });
  }, []);

  return { predecir, resultado, loading, error, limpiar };
}
