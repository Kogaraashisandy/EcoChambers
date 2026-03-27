import { useState, useEffect, useRef } from 'react'

// ── Icono sol animado ─────────────────────────────────────────────────────────
function SunIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" fill="rgba(245,158,11,0.3)"/>
      <line x1="12" y1="1"     x2="12" y2="3"/>
      <line x1="12" y1="21"    x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12"    x2="3"  y2="12"/>
      <line x1="21" y1="12"    x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>
  )
}

// ── Icono ventilador animado ──────────────────────────────────────────────────
function FanIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" fill="rgba(59,130,246,0.3)"/>
      <path d="M12 10C12 10 10 6 12 3C14 6 12 10 12 10Z"
        fill="rgba(59,130,246,0.3)" stroke="currentColor"/>
      <path d="M14 12C14 12 18 14 21 12C18 10 14 12 14 12Z"
        fill="rgba(59,130,246,0.3)" stroke="currentColor"/>
      <path d="M12 14C12 14 14 18 12 21C10 18 12 14 12 14Z"
        fill="rgba(59,130,246,0.3)" stroke="currentColor"/>
      <path d="M10 12C10 12 6 10 3 12C6 14 10 12 10 12Z"
        fill="rgba(59,130,246,0.3)" stroke="currentColor"/>
    </svg>
  )
}

// ── Destellos de sol ──────────────────────────────────────────────────────────
function Sparkles() {
  const sparks = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * 360,
    delay: i * 0.1,
    size: Math.random() * 8 + 6,
    dist: Math.random() * 60 + 80,
  }))

  return (
    <div style={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none', zIndex: 0,
    }}>
      {sparks.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: s.size, height: s.size,
          marginTop: -s.size / 2, marginLeft: -s.size / 2,
          transform: `rotate(${s.angle}deg) translateX(${s.dist}px)`,
          animation: `sparkle 1.5s ease-in-out ${s.delay}s infinite`,
        }}>
          <svg viewBox="0 0 10 10" width={s.size} height={s.size}>
            <polygon points="5,0 6,4 10,5 6,6 5,10 4,6 0,5 4,4"
              fill="#fbbf24" opacity="0.9"/>
          </svg>
        </div>
      ))}
    </div>
  )
}

// ── Determinar aptitud por coordenadas ────────────────────────────────────────
function calcularAptitud(lat, lon) {
  const departamentos = [
    { nombre: 'La Guajira',         latMin: 10.4, latMax: 12.5, lonMin: -73.7, lonMax: -71.1, solar: 6.4, viento: 7.2, temp: 29.0 },
    { nombre: 'Atlántico',          latMin: 10.2, latMax: 11.1, lonMin: -75.2, lonMax: -74.4, solar: 5.6, viento: 5.1, temp: 27.5 },
    { nombre: 'Magdalena',          latMin: 9.0,  latMax: 11.3, lonMin: -74.9, lonMax: -73.5, solar: 6.1, viento: 4.2, temp: 28.5 },
    { nombre: 'Cesar',              latMin: 8.5,  latMax: 10.6, lonMin: -74.0, lonMax: -72.7, solar: 6.3, viento: 4.8, temp: 28.0 },
    { nombre: 'Bolívar',            latMin: 7.8,  latMax: 10.8, lonMin: -75.7, lonMax: -74.0, solar: 5.4, viento: 3.8, temp: 27.8 },
    { nombre: 'Córdoba',            latMin: 7.3,  latMax: 9.5,  lonMin: -76.5, lonMax: -74.8, solar: 5.2, viento: 3.5, temp: 27.0 },
    { nombre: 'Sucre',              latMin: 8.0,  latMax: 10.0, lonMin: -75.7, lonMax: -74.5, solar: 5.3, viento: 3.6, temp: 27.2 },
    { nombre: 'Antioquia',          latMin: 5.5,  latMax: 8.9,  lonMin: -77.1, lonMax: -73.9, solar: 4.8, viento: 2.8, temp: 22.0 },
    { nombre: 'Cundinamarca/Bogotá',latMin: 3.7,  latMax: 5.6,  lonMin: -74.8, lonMax: -73.0, solar: 4.2, viento: 2.5, temp: 14.0 },
    { nombre: 'Valle del Cauca',    latMin: 3.0,  latMax: 5.3,  lonMin: -77.3, lonMax: -75.5, solar: 4.5, viento: 2.9, temp: 23.0 },
  ]

  let depto = departamentos.find(d =>
    lat >= d.latMin && lat <= d.latMax &&
    lon >= d.lonMin && lon <= d.lonMax
  )

  if (!depto) {
    let minDist = Infinity
    departamentos.forEach(d => {
      const centerLat = (d.latMin + d.latMax) / 2
      const centerLon = (d.lonMin + d.lonMax) / 2
      const dist = Math.sqrt((lat - centerLat) ** 2 + (lon - centerLon) ** 2)
      if (dist < minDist) { minDist = dist; depto = d }
    })
  }

  const { solar, viento, temp } = depto
  const maxSolar = 6.4, maxViento = 7.2, maxTemp = 30
  const solarNorm  = solar / maxSolar
  const vientoNorm = viento / maxViento
  const tempPen    = 1 - ((temp - 15) / (maxTemp - 15)) * 0.3
  const score      = solarNorm * 0.45 + vientoNorm * 0.40 + tempPen * 0.15

  const aptitudSolar  = solar  >= 5.5 ? 'óptima' : solar  >= 5.0 ? 'alta' : solar  >= 4.5 ? 'media' : 'baja'
  const aptitudEolica = viento >= 6.0 ? 'óptima' : viento >= 4.5 ? 'alta' : viento >= 3.5 ? 'media' : 'baja'
  const esFavorable   = score >= 0.65 || aptitudSolar === 'óptima' || aptitudSolar === 'alta'

  return { depto: depto.nombre, solar, viento, temp, score, aptitudSolar, aptitudEolica, esFavorable }
}

// ── Pantalla de celebración ───────────────────────────────────────────────────
function Celebracion({ depto, aptitudSolar, aptitudEolica, onCerrar }) {
  const recomendacion = aptitudSolar === 'óptima' || aptitudSolar === 'alta'
    ? 'paneles solares' : 'aerogeneradores eólicos'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5,8,17,0.96)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.4s ease',
    }}>
      <Sparkles />
      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', maxWidth: 480, padding: '0 24px',
      }}>
        <div style={{
          fontSize: '5rem', marginBottom: 24,
          animation: 'spinSun 4s linear infinite',
          display: 'inline-block',
          filter: 'drop-shadow(0 0 30px rgba(245,158,11,0.6))',
        }}>
          ☀
        </div>

        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
          fontWeight: 800, marginBottom: 16, lineHeight: 1.2,
          background: 'linear-gradient(135deg, #fbbf24, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          ¡Felicitaciones!
        </h2>

        <p style={{ fontSize: '1.1rem', color: '#e2e8f0', lineHeight: 1.7, marginBottom: 12 }}>
          Tu zona en{' '}
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>{depto}</span>{' '}
          tiene condiciones{' '}
          <span style={{ color: '#34d399', fontWeight: 700 }}>
            {aptitudSolar === 'óptima' || aptitudSolar === 'alta' ? 'excelentes' : 'favorables'}
          </span>{' '}
          para instalar {recomendacion}.
        </p>

        <div style={{
          display: 'flex', gap: 16, justifyContent: 'center',
          marginBottom: 28, flexWrap: 'wrap',
        }}>
          <div style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12, padding: '10px 20px',
            fontSize: '0.9rem', color: '#fbbf24',
          }}>
            ☀ Solar: <strong>{aptitudSolar}</strong>
          </div>
          <div style={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 12, padding: '10px 20px',
            fontSize: '0.9rem', color: '#60a5fa',
          }}>
            💨 Eólica: <strong>{aptitudEolica}</strong>
          </div>
        </div>

        <p style={{ fontSize: '1rem', color: '#a78bfa', fontWeight: 600, marginBottom: 28 }}>
          Puedes hacer parte de la energía que salve el futuro 🌱
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* ✅ CORREGIDO: faltaba el <a */}
          <a
            href="https://ecosolarcolombia.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', gap: 10,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff', fontWeight: 700, fontSize: '1.05rem',
              padding: '16px 40px', borderRadius: 14,
              textDecoration: 'none',
              boxShadow: '0 0 32px rgba(245,158,11,0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ⚡ Comenzar mi proyecto solar
          </a>
          <button
            onClick={onCerrar}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, color: '#64748b',
              padding: '10px', cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Volver a la plataforma
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Panel de no compatible ────────────────────────────────────────────────────
function NoCompatible({ depto, aptitudSolar, aptitudEolica, onCerrar }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5,8,17,0.96)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 460, padding: '0 24px' }}>
        <div style={{ fontSize: '4rem', marginBottom: 20 }}>🌧</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 12 }}>
          Zona con potencial limitado
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, marginBottom: 24 }}>
          Tu zona en{' '}
          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{depto}</span>{' '}
          tiene condiciones climáticas que limitan la eficiencia de las
          instalaciones renovables, pero eso puede cambiar con la tecnología adecuada.
        </p>
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center',
          marginBottom: 24, flexWrap: 'wrap',
        }}>
          <div style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 10, padding: '8px 16px',
            fontSize: '0.85rem', color: '#fbbf24',
          }}>
            ☀ Solar: <strong>{aptitudSolar}</strong>
          </div>
          <div style={{
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 10, padding: '8px 16px',
            fontSize: '0.85rem', color: '#60a5fa',
          }}>
            💨 Eólica: <strong>{aptitudEolica}</strong>
          </div>
        </div>
        <p style={{ color: '#8b5cf6', fontSize: '0.9rem', marginBottom: 24 }}>
          La tecnología renovable avanza rápido — igual vale la pena explorar opciones.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* ✅ CORREGIDO: faltaba el <a */}
          <a
            href="https://ecosolarcolombia.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.4)',
              color: '#a78bfa', fontWeight: 600,
              padding: '12px 28px', borderRadius: 12,
              textDecoration: 'none', fontSize: '0.95rem',
            }}
          >
            Explorar opciones de todas formas
          </a>
          <button onClick={onCerrar} style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, color: '#475569',
            padding: '10px', cursor: 'pointer', fontSize: '0.85rem',
          }}>
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Checker de ubicación ──────────────────────────────────────────────────────
function UbicacionChecker({ onCerrar }) {
  const [estado, setEstado] = useState('idle') // idle | cargando | resultado | error
  const [resultado, setResultado] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const verificar = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Tu navegador no soporta geolocalización.')
      setEstado('error')
      return
    }
    setEstado('cargando')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        const apt = calcularAptitud(latitude, longitude)
        setResultado(apt)
        setEstado('resultado')
      },
      () => {
        setErrorMsg('No se pudo obtener tu ubicación. Verifica los permisos del navegador.')
        setEstado('error')
      },
      { timeout: 10000 }
    )
  }

  if (estado === 'resultado' && resultado) {
    if (resultado.esFavorable) {
      return (
        <Celebracion
          depto={resultado.depto}
          aptitudSolar={resultado.aptitudSolar}
          aptitudEolica={resultado.aptitudEolica}
          onCerrar={onCerrar}
        />
      )
    }
    return (
      <NoCompatible
        depto={resultado.depto}
        aptitudSolar={resultado.aptitudSolar}
        aptitudEolica={resultado.aptitudEolica}
        onCerrar={onCerrar}
      />
    )
  }

  return (
    <div style={{ padding: '24px 0 8px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📍</div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
        ¿Tu zona es compatible con energía renovable?
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 20 }}>
        Usaremos tu ubicación actual para analizar las condiciones
        climáticas de tu zona y decirte si es apta para solar o eólica.
      </p>

      {estado === 'cargando' && (
        <div style={{
          color: '#a78bfa', fontSize: '0.9rem',
          animation: 'pulse 1.5s ease infinite',
          marginBottom: 16,
        }}>
          Analizando tu ubicación...
        </div>
      )}

      {estado === 'error' && (
        <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.5 }}>
          {errorMsg}
        </p>
      )}

      {estado !== 'cargando' && (
        <button
          onClick={verificar}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none', borderRadius: 12,
            color: '#fff', fontWeight: 700,
            fontSize: '0.95rem', padding: '14px',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(245,158,11,0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ⚡ Verificar mi ubicación ahora
        </button>
      )}
    </div>
  )
}

// ── Menú de opciones ──────────────────────────────────────────────────────────
function MenuOpciones({ onCerrar }) {
  const [vista, setVista] = useState('menu') // menu | solar | eolica | ubicacion

  if (vista === 'ubicacion') return <UbicacionChecker onCerrar={onCerrar} />

  if (vista === 'solar') return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12, textAlign: 'center' }}>☀</div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fbbf24', marginBottom: 12, textAlign: 'center' }}>
        Energía Solar
      </h3>
      {[
        ['¿Qué es?',       'Los paneles fotovoltaicos convierten la luz del sol en electricidad mediante el efecto fotoeléctrico. No necesitan sol directo — funcionan también con luz difusa.'],
        ['¿Cuándo conviene?', 'Cuando la radiación solar supera los 4.5 kWh/m² diarios. La región Caribe tiene 5.5–6.4 kWh/m², comparable con el desierto de Atacama.'],
        ['¿Cuánto genera?', 'Un panel de 400W en La Guajira genera aproximadamente 1.800 kWh al año — suficiente para el 70% del consumo de un hogar colombiano.'],
        ['Ventaja clave',  'Mantenimiento mínimo, sin partes móviles, vida útil de 25–30 años y precios que han caído un 90% en la última década.'],
      ].map(([titulo, texto]) => (
        <div key={titulo} style={{ marginBottom: 12 }}>
          <p style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.85rem', marginBottom: 3 }}>{titulo}</p>
          <p style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: 1.5 }}>{texto}</p>
        </div>
      ))}
      <button onClick={() => setVista('menu')} style={{
        width: '100%', marginTop: 8, background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
        color: '#64748b', padding: '8px', cursor: 'pointer', fontSize: '0.8rem',
      }}>
        ← Volver
      </button>
    </div>
  )

  if (vista === 'eolica') return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: '2rem', marginBottom: 12, textAlign: 'center' }}>💨</div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#60a5fa', marginBottom: 12, textAlign: 'center' }}>
        Energía Eólica
      </h3>
      {[
        ['¿Qué es?',       'Los aerogeneradores convierten la energía cinética del viento en electricidad. Las aspas giran y accionan un generador eléctrico.'],
        ['¿Cuándo conviene?', 'Cuando el viento supera los 5 m/s de forma consistente. La Guajira tiene vientos de 7–11 m/s, lo que la convierte en una de las mejores zonas de América Latina.'],
        ['¿Cuánto genera?', 'Un aerogenerador pequeño de 5 kW con viento de 7 m/s puede generar hasta 12.000 kWh al año — suficiente para 4–5 hogares colombianos.'],
        ['Ventaja clave',  'Genera electricidad de noche, cuando los paneles no funcionan. Es el complemento perfecto de la energía solar.'],
      ].map(([titulo, texto]) => (
        <div key={titulo} style={{ marginBottom: 12 }}>
          <p style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem', marginBottom: 3 }}>{titulo}</p>
          <p style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: 1.5 }}>{texto}</p>
        </div>
      ))}
      <button onClick={() => setVista('menu')} style={{
        width: '100%', marginTop: 8, background: 'transparent',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
        color: '#64748b', padding: '8px', cursor: 'pointer', fontSize: '0.8rem',
      }}>
        ← Volver
      </button>
    </div>
  )

  return (
    <div style={{ padding: '8px 0' }}>
      <p style={{
        color: '#64748b', fontSize: '0.78rem',
        textAlign: 'center', marginBottom: 16,
        textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600,
      }}>
        ¿Qué quieres explorar?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => setVista('solar')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 12, padding: '14px 16px',
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(245,158,11,0.15)'
            e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(245,158,11,0.08)'
            e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)'
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>☀</span>
          <div>
            <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Más sobre energía solar</p>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0, marginTop: 2 }}>Cómo funciona y cuándo conviene</p>
          </div>
          <span style={{ marginLeft: 'auto', color: '#64748b' }}>›</span>
        </button>

        <button
          onClick={() => setVista('eolica')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 12, padding: '14px 16px',
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(59,130,246,0.15)'
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(59,130,246,0.08)'
            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>💨</span>
          <div>
            <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Más sobre energía eólica</p>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: 0, marginTop: 2 }}>Viento, aerogeneradores y potencial</p>
          </div>
          <span style={{ marginLeft: 'auto', color: '#64748b' }}>›</span>
        </button>

        <button
          onClick={() => setVista('ubicacion')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(139,92,246,0.12))',
            border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: 12, padding: '14px 16px',
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
            boxShadow: '0 0 20px rgba(245,158,11,0.1)',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <div>
            <p style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>¿Mi zona es apta para renovables?</p>
            <p style={{ color: '#a78bfa', fontSize: '0.78rem', margin: 0, marginTop: 2 }}>Analizar mi ubicación actual</p>
          </div>
          <span style={{ marginLeft: 'auto', color: '#fbbf24', fontWeight: 700 }}>→</span>
        </button>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function FloatingMenu() {
  const [abierto, setAbierto] = useState(false)
  // ✅ esSol controla qué icono se muestra en el FAB
  const [esSol, setEsSol] = useState(true)
  // ✅ visible controla la opacidad durante el fade entre iconos
  const [iconVisible, setIconVisible] = useState(true)
  const panelRef = useRef(null)

  // ✅ Alternar icono sol ↔ ventilador con fade suave cada 2.5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      // Primero hacer fade out
      setIconVisible(false)
      // Tras 300ms cambiar el icono y hacer fade in
      setTimeout(() => {
        setEsSol(v => !v)
        setIconVisible(true)
      }, 300)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Cerrar al click fuera del panel
  useEffect(() => {
    if (!abierto) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [abierto])

  return (
    <>
      <style>{`
        @keyframes fabPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
          50%       { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: rotate(var(--r,0deg)) translateX(var(--d,80px)) scale(0); }
          50%       { opacity: 1; transform: rotate(var(--r,0deg)) translateX(var(--d,80px)) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spinSun {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      <div ref={panelRef}>
        {/* Panel flotante */}
        {abierto && (
          <div style={{
            position: 'fixed',
            bottom: 90, right: 24,
            width: 320,
            background: '#111827',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 20,
            padding: '20px 20px 16px',
            zIndex: 1000,
            animation: 'panelIn 0.25s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}>
            {/* Header del panel */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>{esSol ? '☀' : '💨'}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa' }}>
                  Energía Renovable
                </span>
              </div>
              <button
                onClick={() => setAbierto(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: '#64748b',
                  width: 28, height: 28, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '0.9rem',
                }}
              >
                ✕
              </button>
            </div>
            <MenuOpciones onCerrar={() => setAbierto(false)} />
          </div>
        )}

        {/* ✅ Botón flotante (FAB) con transición de icono sol ↔ ventilador */}
        <button
          onClick={() => setAbierto(v => !v)}
          style={{
            position: 'fixed',
            bottom: 24, right: 24,
            width: 56, height: 56,
            borderRadius: '50%',
            background: abierto
              ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
              : esSol
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1001,
            color: '#fff',
            animation: abierto ? 'none' : 'fabPulse 2.5s ease infinite',
            transition: 'background 0.4s, transform 0.2s',
            transform: abierto ? 'rotate(45deg)' : 'rotate(0deg)',
            boxShadow: abierto
              ? '0 4px 20px rgba(124,58,237,0.4)'
              : esSol
                ? '0 4px 20px rgba(245,158,11,0.4)'
                : '0 4px 20px rgba(59,130,246,0.4)',
          }}
          onMouseEnter={e => {
            if (!abierto) e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={e => {
            if (!abierto) e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {abierto ? (
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>+</span>
          ) : (
            // ✅ Fade suave entre SunIcon y FanIcon
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: iconVisible ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}>
              {esSol ? <SunIcon size={26} /> : <FanIcon size={26} />}
            </div>
          )}
        </button>
      </div>
    </>
  )
}