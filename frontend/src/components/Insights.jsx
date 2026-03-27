import { useEffect, useRef, useState } from "react";
// ── Íconos SVG ────────────────────────────────────────────────────────────────
function IconTrendUp() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// ── Badge de potencial ────────────────────────────────────────────────────────
function PotencialBadge({ nivel }) {
  const config = {
    alto: { clase: "badge-green", label: "Alto potencial" },
    medio: { clase: "badge-amber", label: "Potencial medio" },
    bajo: { clase: "badge-red", label: "Bajo potencial" },
  };
  const c = config[nivel] || config.bajo;
  return <span className={`badge ${c.clase}`}>{c.label}</span>;
}

// ── Tarjeta de insight genérica ───────────────────────────────────────────────
function InsightCard({ icono, color, label, titulo, texto, delay }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const colorMap = {
    purple: {
      text: "#a78bfa",
      bg: "rgba(139,92,246,0.08)",
      border: "rgba(139,92,246,0.2)",
    },
    green: {
      text: "#34d399",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.2)",
    },
    amber: {
      text: "#fbbf24",
      bg: "rgba(245,158,11,0.08)",
      border: "rgba(245,158,11,0.2)",
    },
    blue: {
      text: "#60a5fa",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.2)",
    },
    red: {
      text: "#f87171",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.2)",
    },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div
      ref={ref}
      className="card"
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        borderLeft: `3px solid ${c.text}`,
        borderRadius: "0 var(--radius-lg) var(--radius-lg) 0",
      }}
    >
      {/* Icono + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: c.bg,
            border: `1px solid ${c.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: c.text,
            flexShrink: 0,
          }}
        >
          {icono}
        </div>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: c.text,
          }}
        >
          {label}
        </span>
      </div>

      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 10,
          lineHeight: 1.3,
        }}
      >
        {titulo}
      </h3>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          lineHeight: 1.7,
        }}
      >
        {texto}
      </p>
    </div>
  );
}
function DiversificacionChart({ porDepto }) {
  if (!porDepto?.length) return null;

  const deptos = ["Atlántico", "Cesar", "La Guajira", "Magdalena"];

  const data = deptos.map((depto) => {
    const solar = porDepto
      .filter((d) => d.departamento === depto && d.tecnología === "Solar")
      .reduce((s, d) => s + d.producción_mwh, 0);
    const eolica = porDepto
      .filter((d) => d.departamento === depto && d.tecnología === "Eólica")
      .reduce((s, d) => s + d.producción_mwh, 0);
    const total = solar + eolica;
    const pctSolar = total ? Math.round((solar / total) * 100) : 0;
    const pctEolica = total ? Math.round((eolica / total) * 100) : 0;

    // Qué tan balanceado está (100 = perfecto 50/50, 0 = todo en una)
    const balance = Math.round(100 - Math.abs(pctSolar - pctEolica));

    return { depto, solar, eolica, total, pctSolar, pctEolica, balance };
  });

  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <p className="section-label" style={{ marginBottom: 6 }}>
        Diversificación energética
      </p>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        Balance Solar vs Eólica por departamento
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          marginBottom: 28,
          lineHeight: 1.5,
          maxWidth: 560,
        }}
      >
        Un departamento diversificado es menos vulnerable a variaciones
        climáticas estacionales. Mayor equilibrio = menor riesgo energético.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {data.map(({ depto, pctSolar, pctEolica, balance, total }) => (
          <div key={depto}>
            {/* Header fila */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                  }}
                >
                  {depto}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                    background:
                      balance >= 60
                        ? "rgba(16,185,129,0.15)"
                        : balance >= 30
                          ? "rgba(245,158,11,0.15)"
                          : "rgba(239,68,68,0.15)",
                    color:
                      balance >= 60
                        ? "#34d399"
                        : balance >= 30
                          ? "#fbbf24"
                          : "#f87171",
                    border: `1px solid ${
                      balance >= 60
                        ? "rgba(16,185,129,0.3)"
                        : balance >= 30
                          ? "rgba(245,158,11,0.3)"
                          : "rgba(239,68,68,0.3)"
                    }`,
                  }}
                >
                  {balance >= 60
                    ? "Bien diversificado"
                    : balance >= 30
                      ? "Diversificación media"
                      : "Alta dependencia"}
                </span>
              </div>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.78rem",
                }}
              >
                {total.toLocaleString()} MWh totales
              </span>
            </div>

            {/* Barra dividida */}
            <div
              style={{
                height: 28,
                borderRadius: 8,
                overflow: "hidden",
                display: "flex",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {/* Solar */}
              <div
                style={{
                  width: `${pctSolar}%`,
                  background: "linear-gradient(90deg, #b45309, #f59e0b)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                  minWidth: pctSolar > 8 ? "auto" : 0,
                }}
              >
                {pctSolar > 8 && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ☀ {pctSolar}%
                  </span>
                )}
              </div>
              {/* Eólica */}
              <div
                style={{
                  width: `${pctEolica}%`,
                  background: "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                  minWidth: pctEolica > 8 ? "auto" : 0,
                }}
              >
                {pctEolica > 8 && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    💨 {pctEolica}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leyenda */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 10,
              borderRadius: 3,
              background: "linear-gradient(90deg, #b45309, #f59e0b)",
            }}
          />
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Energía Solar
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 10,
              borderRadius: 3,
              background: "linear-gradient(90deg, #1d4ed8, #3b82f6)",
            }}
          />
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Energía Eólica
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
          }}
        >
          Índice de balance: 100 = perfectamente diversificado
        </div>
      </div>
    </div>
  );
}

// ── Mapa visual de departamentos ──────────────────────────────────────────────
function MapaDepartamentos({ potencial }) {
  const COLORES_POTENCIAL = {
    alto: {
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.35)",
      text: "#34d399",
    },
    medio: {
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.35)",
      text: "#fbbf24",
    },
    bajo: {
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.35)",
      text: "#f87171",
    },
  };

  const ICONOS_DEPTO = {
    Atlántico: "🌊",
    Cesar: "⛰",
    "La Guajira": "🏜",
    Magdalena: "🌿",
  };

  return (
    <div className="card">
      <p className="section-label" style={{ marginBottom: 6 }}>
        Mapa de potencial
      </p>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        Clasificación por departamento
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          marginBottom: 24,
          lineHeight: 1.5,
        }}
      >
        Basado en tasa de crecimiento de producción durante 2024
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {potencial.map(
          (
            { departamento, potencial: nivel, tasa_crecimiento_pct, total_mwh },
            i,
          ) => {
            const c = COLORES_POTENCIAL[nivel] || COLORES_POTENCIAL.bajo;
            return (
              <div
                key={departamento}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  borderRadius: 14,
                  padding: "14px 18px",
                  transition: "transform 0.2s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateX(4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateX(0)")
                }
              >
                {/* Posición */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: `${c.text}20`,
                    border: `1px solid ${c.text}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: c.text,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>

                {/* Ícono departamento */}
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>
                  {ICONOS_DEPTO[departamento] || "📍"}
                </span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                      marginBottom: 2,
                    }}
                  >
                    {departamento}
                  </div>
                  <div
                    style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}
                  >
                    {total_mwh.toLocaleString()} MWh totales
                  </div>
                </div>

                {/* Tasa */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div
                    style={{
                      color: c.text,
                      fontWeight: 800,
                      fontSize: "1rem",
                      lineHeight: 1,
                    }}
                  >
                    {tasa_crecimiento_pct > 0 ? "+" : ""}
                    {tasa_crecimiento_pct}%
                  </div>
                  <div
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.7rem",
                      marginTop: 2,
                    }}
                  >
                    crecimiento
                  </div>
                </div>

                {/* Badge */}
                <PotencialBadge nivel={nivel} />
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

// ── Tarjeta de recomendación destacada ────────────────────────────────────────
function TarjetaRecomendacion({ recomendacion }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        gridColumn: "1 / -1",
        background:
          "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(16,185,129,0.08))",
        border: "1px solid rgba(139,92,246,0.3)",
        borderRadius: "var(--radius-xl)",
        padding: "36px 40px",
        display: "flex",
        gap: 32,
        alignItems: "flex-start",
        flexWrap: "wrap",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Ícono grande */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(139,92,246,0.15)",
          border: "1px solid rgba(139,92,246,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a78bfa",
          flexShrink: 0,
        }}
      >
        <IconTarget />
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 240 }}>
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#a78bfa",
            marginBottom: 8,
          }}
        >
          Recomendación de inversión
        </p>
        <h3
          style={{
            fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          Priorizar{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a78bfa, #34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {recomendacion.departamento}
          </span>
        </h3>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.95rem",
            lineHeight: 1.7,
            maxWidth: 620,
          }}
        >
          {recomendacion.descripcion}
        </p>
      </div>

      {/* Métrica destacada */}
      <div
        style={{
          background: "rgba(139,92,246,0.1)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 14,
          padding: "20px 28px",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#a78bfa",
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          #1
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Recomendado
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Insights({ insights, porDepto }) {
  if (!insights) return null;
  const {
    potencial_por_departamento,
    estacionalidad,
    tecnologia_dominante,
    recomendacion_inversion,
  } = insights;

  const tarjetas = [
    {
      icono: <IconCalendar />,
      color: "blue",
      label: "Estacionalidad",
      titulo: `Pico de producción en ${estacionalidad.mes_pico}`,
      texto: estacionalidad.descripcion,
      delay: 0,
    },
    {
      icono: <IconBolt />,
      color: "amber",
      label: "Tecnología dominante",
      titulo: `La energía ${tecnologia_dominante.tecnologia.toLowerCase()} lidera con ${tecnologia_dominante.porcentaje}%`,
      texto: tecnologia_dominante.descripcion,
      delay: 120,
    },
    {
      icono: <IconTrendUp />,
      color: "green",
      label: "Crecimiento regional",
      titulo: `${potencial_por_departamento[0]?.departamento} lidera el crecimiento`,
      texto: `Con una tasa proyectada de ${potencial_por_departamento[0]?.tasa_crecimiento_pct}%, ${potencial_por_departamento[0]?.departamento} muestra la expansión más acelerada de la región durante 2024.`,
      delay: 240,
    },
    {
      icono: <IconMap />,
      color: "purple",
      label: "Diferencias geográficas",
      titulo: "Brechas significativas entre departamentos",
      texto: `La diferencia entre el departamento líder y el de menor producción supera los ${(
        (potencial_por_departamento[0]?.total_mwh ?? 0) -
        (potencial_por_departamento.at(-1)?.total_mwh ?? 0)
      ).toLocaleString()} MWh, evidenciando oportunidades de inversión desaprovechadas.`,
      delay: 360,
    },
  ];

  return (
    <section id="insights">
      <div className="section">
        <p className="section-label">Hallazgos del análisis</p>
        <h2 className="section-title">Insights y recomendaciones</h2>
        <p className="section-subtitle">
          Conclusiones generadas automáticamente a partir de los datos de
          producción 2024 y las tendencias detectadas por el modelo.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Fila 1: tarjetas de insight en 2 columnas */}
          <div className="grid-2">
            {tarjetas.map((t) => (
              <InsightCard key={t.label} {...t} />
            ))}
          </div>

          {/* Fila 2: diversificación ancho completo */}
          <DiversificacionChart porDepto={porDepto} />

          {/* Fila 3: mapa + recomendación */}
          <TarjetaRecomendacion recomendacion={recomendacion_inversion} />
        </div>
      </div>
    </section>
  );
}
