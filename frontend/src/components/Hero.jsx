import { useEffect, useRef } from "react";

// Partículas flotantes en canvas
function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      // mezcla de morado y verde
      color:
        Math.random() > 0.5
          ? `rgba(139,92,246,${Math.random() * 0.5 + 0.2})`
          : `rgba(16,185,129,${Math.random() * 0.4 + 0.15})`,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Líneas entre partículas cercanas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Puntos
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

// Icono de rayo SVG inline
function BoltIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export default function Hero({ onScrollToPrediccion }) {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        paddingTop: "80px",
      }}
    >
      <Particles />

      {/* Orbs de fondo */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "-8%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "rgba(139,92,246,0.08)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "-5%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "rgba(16,185,129,0.07)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div className="section" style={{ position: "relative", zIndex: 1 }}>
        <div className="fade-in-up">
          {/* Badges arriba */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 28,
            }}
          >
            <span className="badge badge-green">Región 6 — Caribe</span>
          </div>

          {/* Título */}
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
              maxWidth: 720,
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #e2d9ff, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Producción energética
            </span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #34d399, #10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              renovable
            </span>
            <span style={{ color: "var(--text-primary)" }}> en el Caribe</span>
          </h1>

          {/* Subtítulo */}
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              lineHeight: 1.7,
              maxWidth: 580,
              marginBottom: 40,
            }}
          >
            Análisis de generación solar y eólica en Atlántico, Cesar, La
            Guajira y Magdalena — con predicciones hasta 2027 impulsadas por
            modelos de series de tiempo.
          </p>

          {/* Botones */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={onScrollToPrediccion}>
              <BoltIcon />
              Generar predicción
            </button>
            <button
              className="btn btn-outline"
              onClick={() =>
                document
                  .getElementById("charts")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Ver análisis
            </button>
          </div>

          {/* Mini stats rápidas debajo */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 64,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Departamentos", valor: "4" },
              { label: "Tecnologías", valor: "2" },
              { label: "Período", valor: "2024" },
              { label: "Modelo", valor: "Prophet" },
            ].map(({ label, valor }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: "var(--purple-light)",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {valor}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "var(--text-muted)",
          fontSize: "0.75rem",
          animation: "pulse 2s ease infinite",
        }}
      >
        <span>scroll</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
