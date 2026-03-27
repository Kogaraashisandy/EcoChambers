import { useState } from 'react'

const REPORT_ID  = '6d340e20-8564-4655-9d85-7dd282b28567'
const GROUP_ID   = '231813cb-b9f9-4588-8fbc-a9a36d5ee064'
const TENANT_ID  = 'e2bf1c48-1dae-47ba-9808-67da61e2588d'

const EMBED_URL = `https://app.powerbi.com/reportEmbed?reportId=${REPORT_ID}&groupId=${GROUP_ID}&autoAuth=true&ctid=${TENANT_ID}`

export default function DashboardPowerBI() {
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <section id="powerbi">
      <div className="section">

        <p className="section-label">Análisis avanzado</p>
        <h2 className="section-title">Dashboard Power BI</h2>
        <p className="section-subtitle">
          Visualización interactiva completa de los datos energéticos
          de la Región 6 con filtros dinámicos y drill-down por departamento.
        </p>

        {/* Card contenedora */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Header de la card */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Ícono Power BI */}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="#f59e0b" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="4" height="18" rx="1"/>
                  <rect x="9" y="8" width="4" height="13" rx="1"/>
                  <rect x="15" y="5" width="4" height="16" rx="1"/>
                </svg>
              </div>
              <div>
                <p style={{
                  fontWeight: 700, fontSize: '0.95rem',
                  color: 'var(--text-primary)', margin: 0,
                }}>
                  Reporte interactivo
                </p>
                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-muted)',
                  margin: 0,
                }}>
                  Powered by Microsoft Power BI
                </p>
              </div>
            </div>

            {/* Botón fullscreen */}
            <button
              onClick={() => setFullscreen(v => !v)}
              className="btn btn-outline"
              style={{ padding: '7px 16px', fontSize: '0.8rem', gap: 6 }}
            >
              {fullscreen ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3"/>
                  </svg>
                  Salir
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                  Pantalla completa
                </>
              )}
            </button>
          </div>

          {/* Contenedor del iframe */}
          <div style={{
            position: fullscreen ? 'fixed' : 'relative',
            inset: fullscreen ? 0 : 'auto',
            zIndex: fullscreen ? 9999 : 'auto',
            height: fullscreen ? '100vh' : 720,
            background: '#0a1020',
          }}>

            {/* Loader */}
            {loading && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 16, background: '#0a1020', zIndex: 2,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '3px solid rgba(245,158,11,0.15)',
                  borderTopColor: '#f59e0b',
                  animation: 'spinSun 1s linear infinite',
                }}/>
                <p style={{
                  color: 'var(--text-muted)', fontSize: '0.9rem',
                  animation: 'pulse 1.5s ease infinite',
                }}>
                  Cargando dashboard de Power BI...
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Asegúrate de estar autenticado en tu cuenta Microsoft
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 2,
                background: '#0a1020',
              }}>
                <div style={{
                  textAlign: 'center', maxWidth: 420,
                  padding: '0 24px',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 20px',
                    fontSize: '1.8rem',
                  }}>
                    ⚠
                  </div>
                  <h3 style={{
                    color: '#f87171', fontWeight: 700,
                    fontSize: '1.1rem', marginBottom: 10,
                  }}>
                    No se pudo cargar el dashboard
                  </h3>
                  <p style={{
                    color: 'var(--text-muted)', fontSize: '0.85rem',
                    lineHeight: 1.6, marginBottom: 20,
                  }}>
                    Verifica que estés autenticado en Power BI Service
                    y que tengas permisos para ver este reporte.
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                   <a  
                      href={`https://app.powerbi.com/groups/${GROUP_ID}/reports/${REPORT_ID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '10px 20px', fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      Abrir en Power BI
                    </a>
                    <button
                      onClick={() => { setError(null); setLoading(true) }}
                      className="btn btn-outline"
                      style={{ padding: '10px 20px', fontSize: '0.85rem' }}
                    >
                      Reintentar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Botón cerrar fullscreen */}
            {fullscreen && (
              <button
                onClick={() => setFullscreen(false)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  zIndex: 10, background: 'rgba(5,8,17,0.8)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10, color: 'var(--text-secondary)',
                  width: 36, height: 36, cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1rem',
                }}
              >
                ✕
              </button>
            )}

            {/* iframe */}
            {!error && (
              <iframe
                title="Dashboard Power BI — Energía Renovable Región 6"
                src={EMBED_URL}
                frameBorder="0"
                allowFullScreen
                onLoad={() => setLoading(false)}
                onError={() => { setLoading(false); setError(true) }}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                style={{
                  width: '100%', height: '100%',
                  display: 'block',
                  opacity: loading ? 0 : 1,
                  transition: 'opacity 0.4s ease',
                }}
              />
            )}
          </div>

          {/* Footer de la card */}
          {!fullscreen && (
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', flexWrap: 'wrap', gap: 8,
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                Los datos se actualizan en tiempo real desde Power BI Service
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-purple">Microsoft Power BI</span>
                <span className="badge badge-amber">Región 6</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}