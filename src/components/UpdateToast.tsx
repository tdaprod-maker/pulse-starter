/// <reference types="vite-plugin-pwa/client" />
import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true })

  if (!needRefresh) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: '10px',
        background: 'var(--bg-elevated, #1a1a1a)',
        border: '1px solid var(--border, rgba(255,255,255,0.12))',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        color: 'var(--text-base, #fff)',
        fontSize: '13px',
        fontFamily: 'inherit',
      }}
    >
      <span>Nova versão disponível — toque para atualizar</span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          fontSize: '12px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: 'none',
          background: 'var(--accent, #6366f1)',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        Atualizar
      </button>
    </div>
  )
}
