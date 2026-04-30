export function PrivacyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px', fontFamily: 'Inter, sans-serif', color: '#333', lineHeight: 1.8 }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Política de Privacidade</h1>
      <p style={{ color: '#666', marginBottom: '40px' }}>Última atualização: abril de 2026</p>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px' }}>1. Quem somos</h2>
      <p>O Pulse é um produto da <strong>Agente 17</strong>, empresa brasileira especializada em inteligência artificial e automação. Este documento explica como coletamos, usamos e protegemos seus dados pessoais.</p>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px' }}>2. Dados que coletamos</h2>
      <p>Coletamos os seguintes dados ao criar e usar sua conta:</p>
      <ul style={{ paddingLeft: '24px' }}>
        <li>Nome e endereço de e-mail</li>
        <li>Nome da empresa e segmento de atuação</li>
        <li>Logotipo e imagens enviadas para personalização</li>
        <li>Conteúdo gerado dentro da plataforma (posts, carrosséis, legendas)</li>
        <li>Dados de uso e consumo de pulses</li>
      </ul>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px' }}>3. Como usamos seus dados</h2>
      <p>Seus dados são usados exclusivamente para:</p>
      <ul style={{ paddingLeft: '24px' }}>
        <li>Personalizar os conteúdos gerados pela IA com base no perfil da sua marca</li>
        <li>Gerenciar sua conta e saldo de pulses</li>
        <li>Publicar conteúdo nas redes sociais mediante sua autorização explícita</li>
        <li>Melhorar a qualidade do serviço</li>
      </ul>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px' }}>4. Compartilhamento de dados</h2>
      <p>Não vendemos nem compartilhamos seus dados com terceiros, exceto com os serviços necessários para o funcionamento da plataforma:</p>
      <ul style={{ paddingLeft: '24px' }}>
        <li><strong>Supabase</strong> — armazenamento de dados e autenticação</li>
        <li><strong>Google Gemini</strong> — geração de textos com IA</li>
        <li><strong>FAL.ai</strong> — geração de imagens com IA</li>
        <li><strong>Meta (Instagram/Facebook)</strong> — publicação de conteúdo mediante autorização do usuário</li>
        <li><strong>LinkedIn</strong> — publicação de conteúdo mediante autorização do usuário</li>
      </ul>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px' }}>5. Dados das redes sociais</h2>
      <p>Ao conectar sua conta do Instagram ou LinkedIn, o Pulse solicita apenas as permissões necessárias para publicar conteúdo em seu nome. Não acessamos mensagens privadas, dados de seguidores ou qualquer informação além do necessário para a publicação.</p>
      <p>Você pode revogar o acesso a qualquer momento nas configurações de cada rede social.</p>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px' }}>6. Segurança</h2>
      <p>Seus dados são armazenados com segurança utilizando criptografia e controles de acesso. Aplicamos as melhores práticas de segurança para proteger suas informações.</p>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px' }}>7. Seus direitos</h2>
      <p>De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:</p>
      <ul style={{ paddingLeft: '24px' }}>
        <li>Acessar os dados que temos sobre você</li>
        <li>Corrigir dados incorretos</li>
        <li>Solicitar a exclusão dos seus dados</li>
        <li>Revogar consentimentos dados anteriormente</li>
      </ul>

      <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px' }}>8. Contato</h2>
      <p>Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato pelo e-mail: <a href="mailto:contato@agente17.com.br" style={{ color: '#3A5AFF' }}>contato@agente17.com.br</a></p>

      <p style={{ marginTop: '48px', color: '#999', fontSize: '13px' }}>Agente 17 — agente17.com.br</p>
    </div>
  )
}
