import { useEffect, useRef } from 'react'

interface IntroPageProps {
  onFinish: () => void
}

export function IntroPage({ onFinish }: IntroPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => onFinish())
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <video
        ref={videoRef}
        src="/intro.mp4"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        muted
        playsInline
        onEnded={onFinish}
      />
      <button
        onClick={onFinish}
        style={{
          position: 'absolute', bottom: '32px', right: '32px',
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '8px', padding: '8px 20px', color: 'white',
          fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        Pular →
      </button>
    </div>
  )
}
