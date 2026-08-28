// Envio de email transacional via Resend (REST direto, sem SDK — mesmo padrão
// dos outros /api que falam com APIs externas). Provisionado via Vercel
// Marketplace: RESEND_API_KEY é injetada automaticamente. EMAIL_FROM é definida
// à mão (sandbox 'onboarding@resend.dev' até o domínio pulse.agente17.com.br
// estar verificado no Resend).
//
// IMPORTANTE: se as env vars não estiverem presentes, sendEmail apenas loga e
// retorna { sent: false } — nunca lança. O webhook do Stripe não pode falhar
// (nem devolver 500 pro Stripe) só porque o email não saiu; a conta e os pulses
// já foram provisionados antes.

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ))
}

/**
 * @param {{ to: string, subject: string, html: string, text: string }} msg
 * @returns {Promise<{ sent: boolean, id?: string, error?: string }>}
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Pulse <onboarding@resend.dev>'

  if (!apiKey) {
    console.warn('[sendEmail] RESEND_API_KEY ausente — email NÃO enviado para', to, '| assunto:', subject)
    return { sent: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('[sendEmail] Resend erro', res.status, body)
      return { sent: false, error: body?.message || `Resend ${res.status}` }
    }
    return { sent: true, id: body?.id }
  } catch (err) {
    console.error('[sendEmail] exceção ao chamar Resend:', err)
    return { sent: false, error: err.message }
  }
}

const BRAND = '#3A5AFF'

function shell(innerHtml) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:40px;max-width:480px;">
        <tr><td style="font-size:20px;font-weight:700;color:#111;padding-bottom:8px;">Pulse</td></tr>
        ${innerHtml}
        <tr><td style="padding-top:32px;border-top:1px solid #eee;color:#9aa0a6;font-size:12px;">
          Pulse — agente de design para redes sociais. Desenvolvido pela Agente 17.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function ctaButton(link, label) {
  return `<tr><td style="padding:24px 0;">
    <a href="${escapeHtml(link)}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:13px 28px;border-radius:10px;">${escapeHtml(label)}</a>
  </td></tr>`
}

/**
 * Email de acesso pós-pagamento. Copy diferente para conta nova (definir senha)
 * vs. cliente que já tinha conta (confirmação de crédito).
 * @param {{ to: string, actionLink: string|null, isNew: boolean, planLabel?: string }} p
 */
export async function sendAccessEmail({ to, actionLink, isNew, planLabel }) {
  const safeLink = actionLink || `${(process.env.SITE_URL || 'https://pulse.agente17.com.br')}/definir-senha`
  const plan = planLabel ? ` (${planLabel})` : ''

  if (isNew) {
    const html = shell(`
      <tr><td style="font-size:16px;font-weight:600;color:#111;padding-bottom:12px;">Pagamento confirmado${escapeHtml(plan)} ✓</td></tr>
      <tr><td style="font-size:14px;color:#444;line-height:1.6;">
        Sua conta no Pulse já está ativa e com os pulses creditados. Para entrar, defina uma senha no botão abaixo:
      </td></tr>
      ${ctaButton(safeLink, 'Definir minha senha e acessar')}
      <tr><td style="font-size:13px;color:#777;line-height:1.6;">
        O link vale por 1 hora. Se expirar, use "Esqueci minha senha" na tela de login com este mesmo email (${escapeHtml(to)}).
      </td></tr>
    `)
    const text = [
      `Pagamento confirmado${plan}. Sua conta no Pulse está ativa e com os pulses creditados.`,
      '',
      `Defina sua senha e acesse: ${safeLink}`,
      '',
      `O link vale por 1 hora. Se expirar, use "Esqueci minha senha" na tela de login com o email ${to}.`,
    ].join('\n')
    return sendEmail({ to, subject: 'Seu acesso ao Pulse', html, text })
  }

  const html = shell(`
    <tr><td style="font-size:16px;font-weight:600;color:#111;padding-bottom:12px;">Pagamento confirmado${escapeHtml(plan)} ✓</td></tr>
    <tr><td style="font-size:14px;color:#444;line-height:1.6;">
      Os pulses já foram creditados na sua conta. É só entrar com o email ${escapeHtml(to)}:
    </td></tr>
    ${ctaButton((process.env.SITE_URL || 'https://pulse.agente17.com.br'), 'Acessar o Pulse')}
  `)
  const text = [
    `Pagamento confirmado${plan}. Os pulses já foram creditados na sua conta.`,
    '',
    `Acesse o Pulse com o email ${to}: ${process.env.SITE_URL || 'https://pulse.agente17.com.br'}`,
  ].join('\n')
  return sendEmail({ to, subject: 'Pagamento confirmado — Pulse', html, text })
}
