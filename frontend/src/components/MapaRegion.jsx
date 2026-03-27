import { useState } from "react";

const COLORES_POTENCIAL = {
  alto: {
    fill: "rgba(16,185,129,0.25)",
    stroke: "#10b981",
    text: "#34d399",
    label: "Alto potencial",
  },
  medio: {
    fill: "rgba(245,158,11,0.25)",
    stroke: "#f59e0b",
    text: "#fbbf24",
    label: "Potencial medio",
  },
  bajo: {
    fill: "rgba(239,68,68,0.25)",
    stroke: "#ef4444",
    text: "#f87171",
    label: "Bajo potencial",
  },
};

// Formas SVG aproximadas de los 4 departamentos
// viewBox 0 0 400 420
const SHAPES = {
  "La Guajira": {
    // Península al norte — forma característica
    path: `M 245,10 L 310,15 L 340,40 L 345,80 L 320,110
           L 295,125 L 270,120 L 250,100 L 235,75
           L 230,45 Z`,
    labelX: 285,
    labelY: 70,
  },
  Magdalena: {
    // Costa central, debajo de La Guajira
    path: `M 175,90 L 235,75 L 250,100 L 270,120
           L 255,155 L 235,180 L 210,195 L 185,185
           L 160,165 L 150,140 L 155,110 Z`,
    labelX: 205,
    labelY: 140,
  },
  Atlántico: {
    // Pequeño, costa suroeste
    path: `M 135,155 L 160,165 L 155,195 L 140,210
           L 118,205 L 110,185 L 120,165 Z`,
    labelX: 138,
    labelY: 185,
  },
  Cesar: {
    // Interior, a la derecha de Magdalena
    path: `M 255,155 L 295,125 L 320,110 L 345,80
           L 360,115 L 365,160 L 350,210 L 320,240
           L 285,245 L 255,220 L 240,195 L 235,180
           L 255,155 Z`,
    labelX: 305,
    labelY: 175,
  },
};

function Tooltip({ depto, datos, x, y }) {
  if (!depto || !datos) return null;
  const d = datos.find((d) => d.departamento === depto);
  if (!d) return null;
  const c = COLORES_POTENCIAL[d.potencial] || COLORES_POTENCIAL.bajo;

  // Ajustar posición para que no se salga del SVG
  const tx = Math.min(x, 260);
  const ty = Math.max(y - 10, 10);

  return (
    <g>
      {/* Fondo del tooltip */}
      <rect
        x={tx}
        y={ty}
        width={160}
        height={90}
        rx={8}
        fill="#111827"
        stroke={c.stroke}
        strokeWidth={1}
        opacity={0.97}
      />
      {/* Nombre */}
      <text
        x={tx + 12}
        y={ty + 22}
        fontSize={12}
        fontWeight={700}
        fill={c.text}
      >
        {depto}
      </text>
      {/* Potencial badge */}
      <rect
        x={tx + 12}
        y={ty + 30}
        width={90}
        height={16}
        rx={4}
        fill={`${c.stroke}25`}
      />
      <text
        x={tx + 57}
        y={ty + 42}
        fontSize={9}
        fontWeight={700}
        fill={c.text}
        textAnchor="middle"
      >
        {c.label.toUpperCase()}
      </text>
      {/* Stats */}
      <text x={tx + 12} y={ty + 62} fontSize={10} fill="#94a3b8">
        Total: {d.total_mwh?.toLocaleString()} MWh
      </text>
      <text x={tx + 12} y={ty + 78} fontSize={10} fill="#94a3b8">
        Crecimiento:{" "}
        <tspan fill={c.text} fontWeight={700}>
          {d.tasa_crecimiento_pct > 0 ? "+" : ""}
          {d.tasa_crecimiento_pct}%
        </tspan>
      </text>
    </g>
  );
}

export default function MapaRegion({ potencial, onDeptoClick }) {
  const [hover, setHover] = useState(null);
  const [mousePos, setMouse] = useState({ x: 0, y: 0 });

  if (!potencial?.length) return null;

  const handleMove = (e) => {
    const svg = e.currentTarget.getBoundingClientRect();
    // Escalar coordenadas del mouse al espacio del viewBox
    const scaleX = 400 / svg.width;
    const scaleY = 420 / svg.height;
    setMouse({
      x: (e.clientX - svg.left) * scaleX,
      y: (e.clientY - svg.top) * scaleY,
    });
  };

  return (
    <div className="card">
      <p className="section-label" style={{ marginBottom: 6 }}>
        Mapa regional
      </p>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 6,
        }}
      >
        Región 6 — Caribe colombiano
      </h3>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          marginBottom: 20,
          lineHeight: 1.5,
        }}
      >
        Pasa el mouse sobre cada departamento para ver su potencial energético
      </p>

      {/* Leyenda */}
      <div
        style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}
      >
        {Object.entries(COLORES_POTENCIAL).map(([nivel, c]) => (
          <div
            key={nivel}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: c.fill,
                border: `1.5px solid ${c.stroke}`,
              }}
            />
            {c.label}
          </div>
        ))}
      </div>

      {/* SVG del mapa */}
      <svg
        viewBox="0 0 400 280"
        width="100%"
        style={{ cursor: "crosshair", display: "block" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Fondo sutil del mar */}
        <rect
          x={0}
          y={0}
          width={400}
          height={280}
          fill="rgba(59,130,246,0.03)"
          rx={12}
        />

        {/* Línea de costa decorativa */}
        <path
          d="M 80,10 Q 160,5 245,10 Q 310,15 360,50"
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <text
          x={30}
          y={25}
          fontSize={9}
          fill="rgba(59,130,246,0.35)"
          fontStyle="italic"
        >
          Mar Caribe
        </text>

        {/* Departamentos */}
        {Object.entries(SHAPES).map(([nombre, shape]) => {
          const dato = potencial.find((d) => d.departamento === nombre);
          const nivel = dato?.potencial || "bajo";
          const c = COLORES_POTENCIAL[nivel];
          const isHov = hover === nombre;

          return (
            <g
              key={nombre}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(nombre)}
              onClick={() => onDeptoClick?.(nombre)}
            >
              {/* Sombra al hover */}
              {isHov && (
                <path
                  d={shape.path}
                  fill={c.stroke}
                  opacity={0.15}
                  transform="translate(3,3)"
                />
              )}

              {/* Departamento */}
              <path
                d={shape.path}
                fill={isHov ? c.fill.replace("0.25", "0.45") : c.fill}
                stroke={c.stroke}
                strokeWidth={isHov ? 2 : 1.2}
                style={{
                  transition: "fill 0.2s, stroke-width 0.15s",
                  filter: isHov ? `drop-shadow(0 0 6px ${c.stroke})` : "none",
                }}
              />

              {/* Nombre del departamento */}
              <text
                x={shape.labelX}
                y={shape.labelY}
                textAnchor="middle"
                fontSize={isHov ? 10 : 9}
                fontWeight={isHov ? 700 : 500}
                fill={isHov ? c.text : "rgba(241,245,249,0.7)"}
                style={{ pointerEvents: "none", transition: "all 0.2s" }}
              >
                {nombre.split(" ").map((word, i) => (
                  <tspan key={i} x={shape.labelX} dy={i === 0 ? 0 : 13}>
                    {word}
                  </tspan>
                ))}
              </text>

              {/* Punto indicador */}
              <circle
                cx={shape.labelX}
                cy={shape.labelY - 18}
                r={isHov ? 4 : 2.5}
                fill={c.stroke}
                opacity={isHov ? 1 : 0.6}
                style={{ transition: "all 0.2s" }}
              />
            </g>
          );
        })}

        {/* Tooltip */}
        {hover && (
          <Tooltip
            depto={hover}
            datos={potencial}
            x={mousePos.x + 10}
            y={mousePos.y - 100}
          />
        )}
      </svg>

      {/* Hint de click */}
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          marginTop: 12,
          textAlign: "center",
        }}
      >
        Haz click en un departamento para verlo en el modo comparar
      </p>
    </div>
  );
}
