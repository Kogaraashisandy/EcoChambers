import { useState } from 'react'

export default function FloatingMenu() {
  const [abierto, setAbierto] = useState(false)

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 99999,
    }}>
      <button
        onClick={() => setAbierto(v => !v)}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#f59e0b',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.4rem',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        ☀
      </button>

      {abierto && (
        <div style={{
          position: 'absolute',
          bottom: 70,
          right: 0,
          width: 280,
          background: '#111827',
          border: '1px solid rgba(139,92,246,0.4)',
          borderRadius: 16,
          padding: 20,
          color: '#fff',
        }}>
          <p style={{ marginBottom: 16, color: '#a78bfa', fontWeight: 700 }}>
            Energía Renovable
          </p>
          <p>Menú funcionando ✓</p>
        </div>
      )}
    </div>
  )
}