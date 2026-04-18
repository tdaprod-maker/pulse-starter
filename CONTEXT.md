# Pulse Starter — Contexto do Projeto

> Arquivo de contexto para uso em novas conversas de IA. Atualizado em: 17 abril 2026.

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

### Pendente
- [ ] Passar visual_style para o buildPrompt e buildCarouselPrompt no Gemini
- [ ] Brand Kit refletindo dados do onboarding (logo, cores, fontes)
- [ ] Integração com Stripe para pagamento
- [ ] Planos de pulses (Starter 100, Pro 300, Business 700)
- [ ] Painel administrativo (ver clientes, saldos, uso)
- [ ] Landing page de vendas
- [ ] Supabase separado do Pulse (isolamento total)
- [ ] Email de boas-vindas automático
- [ ] Decisão sobre templates únicos por cliente (Caminho A: mais templates / Caminho B: templates dinâmicos)

---

## 8. Limitação Importante — Templates Visuais

Os templates do Pulse Starter são os mesmos do Pulse (tech-statement, editorial-card, etc.). O que muda por cliente é o conteúdo gerado (textos, tom, imagePrompt) — não o layout visual.

Para layouts verdadeiramente únicos por cliente, há dois caminhos:
- **Caminho A:** Criar 20-30 templates com estilos bem distintos (2-3 semanas)
- **Caminho B:** Templates gerados dinamicamente pela IA (1-2 meses)

Decisão pendente.

---

## 9. Modelo de Negócio Previsto

| Plano | Pulses/mês | Preço |
|---|---|---|
| Starter | 100 | R$ 97/mês |
| Pro | 300 | R$ 197/mês |
| Business | 700 | R$ 397/mês |

Pulses extras: R$ 29 a cada 100 pulses adicionais.

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
