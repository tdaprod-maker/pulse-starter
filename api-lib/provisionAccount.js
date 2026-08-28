import { supabaseAdmin } from './supabaseAdmin.js'

const SITE_URL = process.env.SITE_URL || 'https://pulse.agente17.com.br'

// Trata como "usuário já existe" — a mensagem varia entre versões do GoTrue.
function isAlreadyRegistered(err) {
  if (!err) return false
  const code = err.code || err.name || ''
  const msg = (err.message || '').toLowerCase()
  return (
    code === 'email_exists' ||
    code === 'user_already_exists' ||
    msg.includes('already been registered') ||
    msg.includes('already registered') ||
    msg.includes('already exists')
  )
}

/**
 * Garante que existe uma conta Supabase Auth + linha em `user_tokens` para o
 * email que acabou de pagar no Stripe Checkout, e devolve um link de acesso
 * (fluxo de recovery) para o cliente definir a senha.
 *
 * Idempotente: chamar de novo com o mesmo email não duplica nada.
 *
 * @param {{ email: string, name?: string }} params
 * @returns {Promise<{ userId: string|null, isNew: boolean, actionLink: string|null }>}
 */
export async function ensureUserForCheckout({ email, name }) {
  const admin = supabaseAdmin()
  const normalizedEmail = String(email).trim().toLowerCase()

  // 1. Cria a conta já confirmada (o cliente pagou — não faz sentido barrar por
  //    confirmação de email). O trigger handle_new_user cria a linha em
  //    user_tokens com o saldo de trial; o passo 2 abaixo cobre a corrida.
  let isNew = false
  const { error: createErr } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: {
      ...(name ? { name } : {}),
      source: 'stripe_checkout',
    },
  })
  if (createErr) {
    if (!isAlreadyRegistered(createErr)) {
      console.error('[provisionAccount] createUser falhou:', createErr)
      throw createErr
    }
  } else {
    isNew = true
  }

  // 2. Garante a linha em user_tokens mesmo se o trigger não rodou (conta antiga,
  //    corrida) — ignoreDuplicates: não mexe no saldo de quem já tem linha.
  const { error: upsertErr } = await admin
    .from('user_tokens')
    .upsert({ user_email: normalizedEmail }, { onConflict: 'user_email', ignoreDuplicates: true })
  if (upsertErr) console.error('[provisionAccount] upsert user_tokens:', upsertErr)

  // 2b. Se a conta Auth acabou de ser criada, qualquer access_email_sent_at que
  //     tenha sobrado numa linha de user_tokens pré-existente é lixo de teste
  //     (não há cascade entre auth.users e user_tokens — apagar o usuário no
  //     Auth manualmente deixa a linha órfã). Zera pra o email de acesso poder
  //     ser reenviado. No-op em produção: linha de cliente novo tem esse campo
  //     nulo, e re-provisão de conta existente cai em isNew === false.
  if (isNew) {
    const { error: resetErr } = await admin
      .from('user_tokens')
      .update({ access_email_sent_at: null })
      .eq('user_email', normalizedEmail)
      .not('access_email_sent_at', 'is', null)
    if (resetErr) console.error('[provisionAccount] reset access_email_sent_at:', resetErr)
  }

  // 3. Link de acesso: tipo 'recovery' funciona tanto pra conta nova quanto
  //    existente e cai numa sessão onde updateUser({ password }) já vale — é o
  //    que a tela /definir-senha usa.
  let userId = null
  let actionLink = null
  try {
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: { redirectTo: `${SITE_URL}/definir-senha` },
    })
    if (linkErr) {
      console.error('[provisionAccount] generateLink falhou:', linkErr)
    } else {
      userId = linkData?.user?.id ?? null
      actionLink = linkData?.properties?.action_link ?? null
    }
  } catch (err) {
    console.error('[provisionAccount] generateLink exception:', err)
  }

  return { userId, isNew, actionLink }
}
