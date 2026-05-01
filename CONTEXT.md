# Pulse Starter — Contexto do Projeto

> Arquivo de contexto para uso em novas conversas de IA. Atualizado em: 30 abril 2026.

---

## 1. O que é o Pulse Starter

**Pulse Starter** é a versão SaaS escalável do Pulse, desenvolvida para ser vendida como produto self-service para micro e pequenas empresas e empreendedores.

Diferente do Pulse (versão interna da Agente 17), o Pulse Starter é multi-tenant — cada cliente tem seu próprio espaço isolado, Brand Kit personalizado e saldo de pulses independente.

**Repositório GitHub:** `https://github.com/tdaprod-maker/pulse-starter`
**URL de produção:** `https://pulse-starter.vercel.app`
**Base:** clonado do Pulse em 17/04/2026

---

## 2. Diferenças em relação ao Pulse (versão Agente 17)

| Funcionalidade | Pulse | Pulse Starter |
|---|---|---|
| Cadastro | Manual (Supabase dashboard) | Self-service |
| Onboarding | Não tem | 7 passos |
| Isolamento de dados | Parcial | RLS ativo no Supabase |
| Pulses iniciais | Manual | 10 pulses automáticos ao cadastrar |
| Contexto de marca no Gemini | Não | Sim (segmento + tom + referências visuais) |
| Pagamento | Não | Previsto (Stripe — não implementado) |

---

## 3. Stack

Mesma stack do Pulse:
- React 19, TypeScript, Vite, Tailwind, Zustand, React Konva
- Vercel API Routes (Node.js)
- Google Gemini 2.5 Flash (com suporte a visão)
- FAL.ai (FLUX Schnell + Kontext)
- Supabase (mesmo projeto do Pulse por enquanto)
- LinkedIn API, Instagram Graph API

---

## 4. Banco de Dados (Supabase)

**Mesmo projeto Supabase do Pulse** — compartilhado por enquanto.

### Tabelas
- `brand_config` — Brand Kit do usuário. Campos adicionais: `segment`, `tone`, `business_name`, `visual_references`, `visual_style`, `font_title`, `font_body`
- `user_tokens` — saldo de pulses por usuário
- `posts` — posts salvos
- `carousels` — carrosséis salvos

### RLS (Row Level Security)
- Ativo em todas as tabelas
- Cada usuário só acessa seus próprios dados
- Políticas criadas para SELECT, INSERT e UPDATE

### Trigger automático
- `on_auth_user_created` — cria 10 pulses automaticamente ao cadastrar novo usuário

---

## 5. Fluxo do Novo Usuário

1. Acessa pulse-starter.vercel.app
2. Clica em "Criar conta"
3. Preenche email e senha
4. Confirma email (link enviado pelo Supabase)
5. Loga → sistema verifica se tem brand_config via maybeSingle()
6. Se não tiver → redireciona para /onboarding
7. Onboarding 7 passos:
   - Passo 1: Nome da empresa
   - Passo 2: Segmento (12 opções incluindo Academia/Esportes, Jurídico)
   - Passo 3: Tom de voz (profissional, descontraído, inspiracional, técnico)
   - Passo 4: Upload do logo
   - Passo 5: Fontes (título e body — 8 opções cada)
   - Passo 6: Cores (presets + seletor customizado)
   - Passo 7: Referências visuais (até 3 imagens analisadas pelo Gemini Vision)
8. Ao concluir → salva brand_config + redireciona para o Editor
9. Já tem 10 pulses disponíveis

---

## 6. Personalização por Cliente

O Gemini recebe contexto de marca em cada geração:
- `businessName` — nome da empresa
- `segment` — segmento do negócio
- `tone` — tom de voz
- `visual_style` — perfil visual extraído das referências (pendente integração no prompt)

### Análise de referências visuais
- Cliente sobe até 3 imagens de posts que admira
- Gemini Vision analisa e extrai: estilo, cores predominantes, tipo de imagem, composição, tom emocional
- Resultado salvo em `visual_style` no brand_config
- **Importante:** não é treinamento de modelo — é descrição textual do estilo incluída no prompt a cada geração

---

## 7. Status Atual

### Implementado
- [x] Clone do Pulse com repositório separado no GitHub
- [x] Deploy na Vercel (pulse-starter.vercel.app)
- [x] Tela de login com opção de cadastro self-service
- [x] Onboarding 7 passos completo
- [x] RLS ativo no Supabase — isolamento por usuário
- [x] 10 pulses automáticos ao cadastrar
- [x] Contexto de marca passado ao Gemini (segmento + tom) no Editor e Carrossel
- [x] Análise de referências visuais via Gemini Vision
- [x] Redirecionamento automático para onboarding em novos usuários
- [x] Sanitização de nome de arquivo no upload de referências
- [x] Campo brand_description (descrição livre da marca) no onboarding e no Gemini
- [x] visual_style das referências visuais injetado no prompt do Gemini
- [x] brand_description passado para o Gemini no Editor e Carrossel
- [x] Brand Kit refletindo dados do onboarding (getSession corrigido)
- [x] Turbinador de prompt — botão ⚡ no AIPanel que enriquece o prompt com contexto da marca via Gemini
- [x] Limite de referências visuais aumentado para 5
- [x] brand_description integrado em todo o fluxo de geração
- [x] PostReviewer — agente de análise com score visual, score de legenda, pontos positivos e sugestões
- [x] Cor de destaque usa color_primary do Brand Kit automaticamente
- [x] Templates renomeados para linguagem genérica
- [x] Descrições dos templates no prompt do Gemini atualizadas
- [x] Aviso visual na Topbar quando pulses estão baixos (vermelho) ou zerados (saldo esgotado)
- [x] Erro claro ao tentar gerar post sem pulses suficientes
- [x] Débito de pulses funcionando corretamente no Editor
- [x] PULSE_COSTS definido — POST: 2 pulses, CAROUSEL_SLIDE: 1 pulse, EDIT_IMAGE: 3 pulses, REVIEW_POST: 1 pulse
- [x] Débito variável de pulses por tipo de ação
- [x] Botão de gerar post mostra custo "✦ Gerar · 2 pulses"
- [x] Botão de gerar carrossel mostra custo dinâmico (ex: "Gerar Carrossel · 4 pulses")
- [x] generateImage aceita custo variável para diferenciar post de slide de carrossel
- [x] Aviso visual na Topbar com estados: normal (azul), baixo (vermelho), zerado (saldo esgotado)
- [x] Erro claro ao tentar gerar sem pulses suficientes
- [x] Prompt turbinado no CarouselPage (⚡ Turbinar prompt)
- [x] Regerar imagem de slide específico no modal do carrossel (1 pulse)
- [x] Upload manual de foto em slide específico no modal
- [x] Biblioteca de fotos do Brand Kit disponível no modal do carrossel
- [x] Seletor de emojis em dropdown no PropertiesPanel (editor de texto)
- [x] Débitos corretos por tipo de ação implementados em todos os componentes
- [x] Atualização imediata do saldo de pulses via evento customizado
- [x] Sidebar renomeada — Templates e Samples unificados como "Estilos"
- [x] Vídeo de intro antes da tela de login (/public/intro.mp4)
- [x] Painel administrativo (/admin) — lista de usuários, saldo de pulses, botão de adicionar pulses — acesso restrito ao admin
- [x] Página Minha Conta (/account) — saldo de pulses, % utilizado, custo por ação, dados da conta
- [x] Link "Minha Conta" na Topbar para todos os usuários
- [x] Link "Admin" na Topbar visível apenas para o administrador
- [x] Página de Vídeo — busca clipes do Pexels por tema com tradução automática via Gemini
- [x] Download de clipes individuais do Pexels
- [x] Fluxo de navegação corrigido — intro → login → onboarding (novo) ou editor (existente)
- [x] Página de Política de Privacidade em /privacy (acessível sem login)
- [x] Fluxo de navegação corrigido — intro (com logout) → login → onboarding (novo) ou editor (existente)
- [x] GPT Image 2 identificado como próximo modelo de imagem (via FAL.ai, US$ 0,01/imagem baixa qualidade)
- [x] Logo do carrossel usa Brand Kit do cliente em vez do logo hardcoded
- [x] Drag do logo no carrossel corrigido (scaleY 1350)
- [x] Edge Function send-welcome-email criada no Supabase com Resend
- [x] Railway + FFmpeg funcionando para montagem de vídeo
- [x] Upload de clipes próprios do cliente na página de vídeo

### Pendente
- [ ] Meta/Instagram OAuth para múltiplos usuários — app em desenvolvimento, painel com bugs, retomar quando estável
- [ ] Configurar política de privacidade no painel Meta (URL: pulse-starter.vercel.app/privacy)
- [ ] Submeter app Meta para revisão e publicação
- [ ] Redesign dos templates (Estilos) para padrões visuais virais e profissionais — aguardando referências visuais do Ricardo
- [ ] Avaliar substituição do FLUX Schnell pelo GPT Image 2 (baixa qualidade US$ 0,01 vs US$ 0,003 atual)
- [ ] Email de boas-vindas — aguardando verificação do domínio agente17.com.br no Resend (André tem acesso ao DNS)
- [ ] Trigger automático do email de boas-vindas via Supabase webhook
- [ ] Logo e texto sobrepostos nos vídeos gerados
- [ ] Stripe — pagamento automático e renovação de pulses
- [ ] Painel administrativo melhorado
- [ ] Landing page de vendas
- [ ] Supabase separado do Pulse
- [ ] Revisar e atualizar templates (Estilos) para padrões visuais mais virais — layouts modernos, tipografia impactante, composições que performam melhor em redes sociais

---

## 8. Limitação Importante — Templates Visuais

Os templates do Pulse Starter são os mesmos do Pulse (tech-statement, editorial-card, etc.). O que muda por cliente é o conteúdo gerado (textos, tom, imagePrompt) — não o layout visual.

Para layouts verdadeiramente únicos por cliente, há dois caminhos:
- **Caminho A:** Criar 20-30 templates com estilos bem distintos (2-3 semanas)
- **Caminho B:** Templates gerados dinamicamente pela IA (1-2 meses)

Decisão pendente.

---

## 8b. Fluxo de Pulses Previsto com Stripe

**Fluxo de pulses previsto com Stripe:**
- Cliente paga mensalidade → recebe 100 pulses
- Pulses acabam → aviso na Topbar + mensagem de erro → botão "Comprar mais pulses"
- Renovação automática mensal se pagamento ativo

---

## 9. Modelo de Negócio Previsto

**Plano Starter (único por enquanto):**
- 50 pulses/mês
- Equivale a ~25 posts simples OU ~10 carrosséis de 5 slides OU mix de ~19 publicações
- Preço sugerido: R$ 47/mês
- Custo real: ~R$ 0,85/mês
- Margem: ~98%

**Custos por ação:**
- Gerar post (1 imagem): 2 pulses
- Slide de carrossel: 1 pulse por slide
- Editar imagem com IA: 3 pulses
- Revisar post (agente): 1 pulse
- Turbinar prompt: gratuito

**Estratégia MVP — Pronto para vender:**
- Produto funcional com onboarding completo, geração de posts, carrossel, publicação no LinkedIn e Instagram
- Venda manual via PIX — cliente paga, admin cria conta e adiciona 50 pulses no painel
- Painel admin permite gerenciar clientes sem acesso ao Supabase

---

## 10. Comandos

```bash
# Rodar localmente
cd /Users/ricardojimenes/Desktop/pulse-starter
npm install
npm run dev

# Deploy (automático ao push para main)
git add .
git commit -m "..."
git push
```

## 11. Próxima Sessão

### Redesign dos Templates (Estilos)
- Fluxo definido: Claude apresenta previews visuais estáticos de 4 novos templates no chat → Ricardo aprova ou ajusta → implementação no código
- Referências analisadas: carrosséis dark com tipografia bold, editorial com foto full-frame, InstaChic com texturas, posts Vogue/Breton/Maido/Zara/Nike
- Padrão dominante nas referências: foto ocupa o frame, texto mínimo e intencional, tipografia com personalidade, composição como bloco único
- Cada template novo precisa ter: fonte diferente, elemento gráfico diferente, zona de texto diferente — não variações do mesmo layout
- Dois modos de post a suportar: gerado por IA (FLUX) e foto do próprio cliente

### Correções feitas nesta sessão
- Download corrigido: crossOrigin anonymous adicionado no carregamento do logo para evitar canvas contaminado no export

## 12. Sessão 01/05/2026 — O que foi feito

### Correções
- Download corrigido: crossOrigin anonymous adicionado no logo para evitar canvas contaminado
- Tamanho padrão do logo reduzido de 400px para 160px

### Tema por Brand Kit
- ThemeContext refatorado para aceitar initialTheme
- App.tsx agora carrega o Brand Kit do Supabase e monta o tema com color_primary, font_title e font_body antes de renderizar
- Todos os templates agora recebem cores e fontes reais do cliente via theme

### Fontes
- Adicionadas 4 novas fontes: Cormorant Garamond, DM Sans, Plus Jakarta Sans, Lato
- Total de 12 fontes disponíveis

### Templates criados
- Sport Arena (ex Game Day) — esporte, 4 variantes, usa Brand Kit do cliente, overlay 0.65, prompt Gemini configurado
- Food Editorial — gastronomia premium, fundo escuro, tipografia serifada no rodapé, 4 variantes
- Food Promo — gastronomia comercial, fundo bege, bold, botão CTA com cor do Brand Kit, substitui o Promoção antigo

### Biblioteca de Fotos
- Botão "Gerar variação com IA · 3 pulses" adicionado no ImagePanel
- Cliente seleciona foto da biblioteca → aplica como fundo → pode gerar variação com FLUX Kontext

### Próxima sessão — Templates a criar
- Negócios (business card, resultado, dado de impacto)
- Medicina
- Construção Civil
- Arquitetura
- Odontologia
- Imobiliária
- Moda
- Móveis
