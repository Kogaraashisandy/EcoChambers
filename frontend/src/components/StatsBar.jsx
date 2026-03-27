import { useEffect, useRef, useState } from "react";

// Anima un número desde 0 hasta el valor final
function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || !target) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return value;
}

function formatMwh(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

// Icono genérico SVG
function Icon({ type }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (type === "total")
    return (
      <svg {...props}>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    );
  if (type === "solar")
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  if (type === "eolica")
    return (
      <svg {...props}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  if (type === "lider")
    return (
      <svg {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  return null;
}

function StatCard({
  icon,
  label,
  valor,
  sufijo = "",
  color,
  delay,
  shouldStart,
}) {
  const ref = useRef(null);
  const animated = useCountUp(valor, 1800, shouldStart);

  const colorMap = {
    purple: {
      text: "#a78bfa",
      bg: "rgba(139,92,246,0.1)",
      border: "rgba(139,92,246,0.25)",
    },
    green: {
      text: "#34d399",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.25)",
    },
    amber: {
      text: "#fbbf24",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.25)",
    },
    blue: {
      text: "#60a5fa",
      bg: "rgba(59,130,246,0.1)",
      border: "rgba(59,130,246,0.25)",
    },
  };
  const c = colorMap[color] || colorMap.purple;

  return (
    <div
      ref={ref}
      className="card fade-in-up"
      style={{
        animationDelay: `${delay}ms`,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Icono */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: c.bg,
          border: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: c.text,
        }}
      >
        <Icon type={icon} />
      </div>

      {/* Número animado */}
      <div>
        <div
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
            fontWeight: 800,
            color: c.text,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {typeof valor === "number" ? formatMwh(animated) + sufijo : valor}
        </div>
        <div
          style={{
            color: "var(--text-muted)",
            fontSize: "0.8rem",
            marginTop: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      </div>

      {/* Barra decorativa inferior */}
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: c.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: shouldStart ? "100%" : "0%",
            background: c.text,
            borderRadius: 2,
            transition: "width 1.8s cubic-bezier(0.16,1,0.3,1)",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

export default function StatsBar({ stats }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  // Dispara la animación cuando la sección entra en viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!stats) return null;

  const tarjetas = [
    {
      icon: "total",
      label: "Producción total",
      valor: stats.total_mwh,
      sufijo: " MWh",
      color: "purple",
      delay: 0,
    },
    {
      icon: "solar",
      label: "Energía solar",
      valor: stats.solar_mwh,
      sufijo: " MWh",
      color: "amber",
      delay: 120,
    },
    {
      icon: "eolica",
      label: "Energía eólica",
      valor: stats.eolica_mwh,
      sufijo: " MWh",
      color: "blue",
      delay: 240,
    },
    {
      icon: "lider",
      label: "Departamento líder",
      valor: stats.departamento_lider,
      color: "green",
      delay: 360,
    },
  ];

  return (
    <section id="stats" ref={sectionRef}>
      <div className="section" style={{ paddingTop: 0 }}>
        <p className="section-label">Resumen 2024</p>
        <h2 className="section-title">Producción en números</h2>
        <p className="section-subtitle">
          Datos agregados de generación renovable en los cuatro departamentos de
          la Región 6 durante el año 2024.
        </p>

        <div className="grid-4">
          {tarjetas.map((t) => (
            <StatCard key={t.label} {...t} shouldStart={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}
