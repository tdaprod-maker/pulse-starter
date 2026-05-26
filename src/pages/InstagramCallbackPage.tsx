import { useEffect } from 'react'

export function InstagramCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const igUserId = params.get('ig_user_id')
    const username = params.get('username')
    const expiresAt = params.get('expires_at')
    const error = params.get('instagram_error')

    if (accessToken && igUserId) {
      window.opener?.postMessage(
        {
          type: 'instagram_oauth',
          access_token: accessToken,
          ig_user_id: igUserId,
          username: username ?? '',
          expires_at: expiresAt ?? '',
        },
        window.location.origin,
      )
    } else {
      window.opener?.postMessage({ type: 'instagram_oauth_error', error }, window.location.origin)
    }

    setTimeout(() => window.close(), 300)
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0D0D0D', color: '#fff',
      fontFamily: 'sans-serif', fontSize: '14px',
    }}>
      Conectando ao Instagram...
    </div>
  )
}
