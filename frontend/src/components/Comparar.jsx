import { useState, useMemo, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";

const DEPARTAMENTOS = ["Atlántico", "Cesar", "La Guajira", "Magdalena"];
const TECNOLOGIAS   = ["Todas", "Solar", "Eólica"];
const COLORES = { depto1: "#8b5cf6", depto2: "#10b981" };

function descargarImagen(ref, nombreArchivo) {
  if (!ref.current) return
  html2canvas(ref.current, {
    backgroundColor: '#111827', scale: 2, useCORS: true,
  }).then(canvas => {
    const a  = document.createElement('a')
    a.href   = canvas.toDataURL('image/png')
    a.download = `${nombreArchivo}.png`
    a.click()
  })
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#111827", border: "1px solid rgba(139,92,246,0.4)",
      borderRadius: 12, padding: "12px 16px",
      fontSize: "0.85rem", minWidth: 200,
    }}>
      <p style={{ color: "var(--text-muted)", marginBottom: 8, fontSize: "0.75rem" }}>
        {label}
      </p>
      {payload.map(p => (
        <div key={p.name} style={{
          display: "flex", justifyContent: "space-between",
          gap: 24, color: p.color, marginBottom: 4,
        }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 700 }}>
            {Number(p.value).toLocaleString()} MWh
          </span>
        </div>
      ))}
      {payload.length === 2 && (
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          marginTop: 8, paddingTop: 8,
          color: "var(--text-muted)", fontSize: "0.75rem",
          display: "flex", justifyContent: "space-between",
        }}>
          <span>Diferencia</span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
            {Math.abs(payload[0].value - payload[1].value).toLocaleString()} MWh
          </span>
        </div>
      )}
    </div>
  );
}

// ── Selector de departamento ──────────────────────────────────────────────────
function SelectorDepto({ label, valor, onChange, excluir, color }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{
        display: "block", fontSize: "0.75rem", fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.08em",
        color, marginBottom: 8,
      }}>
        {label}
      </label>
      <select value={valor} onChange={e => onChange(e.target.value)}>
        {DEPARTAMENTOS.filter(d => d !== excluir).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
}

// ── Tarjeta resumen ───────────────────────────────────────────────────────────
function ResumenCard({ departamento, datos, tecnologia, color }) {
  const filtrado = useMemo(() => datos.filter(d => {
    const mismoDepto = d.departamento === departamento;
    const mismaTech  = tecnologia === "Todas" || d.tecnología === tecnologia;
    return mismoDepto && mismaTech;
  }), [datos, departamento, tecnologia]);

  const total  = filtrado.reduce((s, d) => s + d.producción_mwh, 0);
  const solar  = filtrado.filter(d => d.tecnología === "Solar").reduce((s, d) => s + d.producción_mwh, 0);
  const eolica = filtrado.filter(d => d.tecnología === "Eólica").reduce((s, d) => s + d.producción_mwh, 0);
  const domina = solar >= eolica ? "Solar" : "Eólica";

  return (
    <div style={{
      background: `${color}0d`, border: `1px solid ${color}33`,
      borderRadius: 14, padding: "16px 20px",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontWeight: 700, color, fontSize: "0.95rem" }}>{departamento}</span>
        <span className={`badge ${domina === "Solar" ? "badge-amber" : "badge-purple"}`}
          style={{ fontSize: "0.7rem" }}>
          {domina}
        </span>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color, lineHeight: 1 }}>
            {(total / 1000).toFixed(1)}k
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 2 }}>
            MWh totales
          </div>
        </div>
        <div style={{ borderLeft: `1px solid ${color}22`, paddingLeft: 16 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>☀ {solar.toLocaleString()}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4 }}>💨 {eolica.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

// ── Gráfica comparativa de líneas ─────────────────────────────────────────────
function GraficaComparativa({ datos, depto1, depto2, tecnologia }) {
  const pivotado = useMemo(() => {
    const mapa = {};
    datos.filter(d => {
      const deptoOk = d.departamento === depto1 || d.departamento === depto2;
      const techOk  = tecnologia === "Todas" || d.tecnología === tecnologia;
      return deptoOk && techOk;
    }).forEach(({ mes, departamento, producción_mwh }) => {
      if (!mapa[mes]) mapa[mes] = { mes };
      mapa[mes][departamento] = (mapa[mes][departamento] || 0) + producción_mwh;
    });
    return Object.values(mapa).sort((a, b) => a.mes.localeCompare(b.mes));
  }, [datos, depto1, depto2, tecnologia]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={pivotado} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="mes" tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          tickFormatter={v => v.slice(5)} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "0.78rem", paddingTop: 12 }}
          formatter={v => <span style={{ color: "var(--text-secondary)" }}>{v}</span>} />
        <Line type="monotone" dataKey={depto1} stroke={COLORES.depto1} strokeWidth={2.5}
          dot={{ r: 3, fill: COLORES.depto1, strokeWidth: 0 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey={depto2} stroke={COLORES.depto2} strokeWidth={2.5}
          strokeDasharray="6 3" dot={{ r: 3, fill: COLORES.depto2, strokeWidth: 0 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Gráfica de barras comparativa ─────────────────────────────────────────────
function GraficaBarrasComparativa({ datos, depto1, depto2, tecnologia }) {
  const pivotado = useMemo(() => {
    const techs = tecnologia === "Todas" ? ["Solar", "Eólica"] : [tecnologia];
    return techs.map(tech => {
      const v1 = datos.filter(d => d.departamento === depto1 && d.tecnología === tech).reduce((s, d) => s + d.producción_mwh, 0);
      const v2 = datos.filter(d => d.departamento === depto2 && d.tecnología === tech).reduce((s, d) => s + d.producción_mwh, 0);
      return { tecnologia: tech, [depto1]: v1, [depto2]: v2 };
    });
  }, [datos, depto1, depto2, tecnologia]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={pivotado} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="tecnologia" tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false}
          tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "0.78rem", paddingTop: 8 }}
          formatter={v => <span style={{ color: "var(--text-secondary)" }}>{v}</span>} />
        <Bar dataKey={depto1} fill={COLORES.depto1} radius={[6, 6, 0, 0]} maxBarSize={52} />
        <Bar dataKey={depto2} fill={COLORES.depto2} radius={[6, 6, 0, 0]} maxBarSize={52} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Comparar({ mensual, porDepto }) {
  const [depto1,     setDepto1]     = useState("Atlántico");
  const [depto2,     setDepto2]     = useState("La Guajira");
  const [tecnologia, setTecnologia] = useState("Todas");

  const refLineas = useRef(null);
  const refBarras = useRef(null);

  if (!mensual || !porDepto) return null;
  const datosCompletos = porDepto;

  return (
    <section id="comparar">
      <div className="section">
        <p className="section-label">Modo comparar</p>
        <h2 className="section-title">Departamento vs Departamento</h2>
        <p className="section-subtitle">
          Selecciona dos departamentos y un tipo de energía para comparar su producción lado a lado.
        </p>

        {/* Controles */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
            <SelectorDepto label="Departamento 1" valor={depto1} onChange={setDepto1} excluir={depto2} color={COLORES.depto1} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
              paddingBottom: 2, color: "var(--text-muted)", fontWeight: 800, fontSize: "1rem", minWidth: 32 }}>
              VS
            </div>
            <SelectorDepto label="Departamento 2" valor={depto2} onChange={setDepto2} excluir={depto1} color={COLORES.depto2} />
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--text-muted)", marginBottom: 8 }}>
                Tecnología
              </label>
              <select value={tecnologia} onChange={e => setTecnologia(e.target.value)}>
                {TECNOLOGIAS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <ResumenCard departamento={depto1} datos={datosCompletos} tecnologia={tecnologia} color={COLORES.depto1} />
          <ResumenCard departamento={depto2} datos={datosCompletos} tecnologia={tecnologia} color={COLORES.depto2} />
        </div>

        {/* Gráficas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Líneas */}
          <div className="card" ref={refLineas}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 4 }}>Evolución mensual</p>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  {depto1} <span style={{ color: "var(--text-muted)" }}>vs</span> {depto2} — {tecnologia}
                </h3>
              </div>
              <button
                className="btn btn-outline"
                style={{ padding: "6px 14px", fontSize: "0.8rem", flexShrink: 0 }}
                onClick={() => descargarImagen(refLineas, `comparar-lineas-${depto1}-vs-${depto2}`)}
              >
                ⬇ Descargar imagen
              </button>
            </div>
            <GraficaComparativa datos={mensual} depto1={depto1} depto2={depto2} tecnologia={tecnologia} />
          </div>

          {/* Barras */}
          <div className="card" ref={refBarras}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 4 }}>Totales acumulados</p>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Producción total por tecnología
                </h3>
              </div>
              <button
                className="btn btn-outline"
                style={{ padding: "6px 14px", fontSize: "0.8rem", flexShrink: 0 }}
                onClick={() => descargarImagen(refBarras, `comparar-barras-${depto1}-vs-${depto2}`)}
              >
                ⬇ Descargar imagen
              </button>
            </div>
            <GraficaBarrasComparativa datos={datosCompletos} depto1={depto1} depto2={depto2} tecnologia={tecnologia} />
          </div>

        </div>
      </div>
    </section>
  );
}