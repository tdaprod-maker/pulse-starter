import { useEffect } from 'react'

export function LinkedInCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('linkedin_token')
    const sub = params.get('linkedin_sub')
    const name = params.get('linkedin_name')
    const error = params.get('linkedin_error')

    const isRedirectFlow = !window.opener

    if (token && sub) {
      localStorage.setItem('linkedin_token', token)
      localStorage.setItem('linkedin_sub', sub)
      localStorage.setItem('linkedin_name', name ?? '')

      if (isRedirectFlow) {
        window.location.replace('/brand')
        return
      }

      window.opener.postMessage(
        { type: 'linkedin_auth', linkedin_token: token, linkedin_sub: sub, linkedin_name: name ?? '' },
        window.location.origin,
      )
    } else {
      if (isRedirectFlow) {
        window.location.replace('/brand')
        return
      }
      window.opener?.postMessage({ type: 'linkedin_auth_error', error }, window.location.origin)
    }

    setTimeout(() => window.close(), 300)
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0D0D0D', color: '#fff',
      fontFamily: 'sans-serif', fontSize: '14px',
    }}>
      Conectando ao LinkedIn...
    </div>
  )
}
