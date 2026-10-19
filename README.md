# Arcana Frontend 🔮

Angular standalone para tarot e mapa natal, integrado à [API Arcana](https://github.com/FATEC-BOYS/arcana-backend).

## Executar

Node 22.12+ ou 24. Instale com `npm ci` e execute:

```bash
npm start -- --proxy-config proxy.conf.json
```

Frontend em http://localhost:4200; backend local esperado em http://localhost:8000.

## Fluxos integrados

- Cadastro/login, sessão com refresh rotativo, perfil, logout global e exclusão da conta.
- Proteção contra 401 e respostas tardias de sessões anteriores após logout ou novo login.
- Recuperação e redefinição de senha pelo token no fragmento do link de e-mail.
- Catálogo da API com pesquisa e filtro de arcanos.
- Tiragem idempotente, revelação das cartas sorteadas, interpretação, fontes, retry e conversa.
- Diário em formato de livro, anotações privadas, favoritos e histórico paginado.
- Aviso antes de perder anotações não salvas ao mudar de leitura, navegar ou fechar a aba;
  rascunhos permanecem somente na memória da página, não no armazenamento local.
- Mapas natais, horário desconhecido, posições, SVG quando disponível e interpretação.
- Limite de data local no formulário e proteção contra respostas antigas no histórico de mapas.
- Estados de carregamento, indisponibilidade, limites e falhas explícitas; sem interpretação simulada no app.

O backend precisa estar acessível. Interpretação requer chave de modelo no **backend**;
recuperação por e-mail requer SMTP configurado. Não há LLM ou credenciais do provedor no frontend.

## Deploy

`npm run build` gera `dist/arcana/browser`. Configure o host para servir index.html nas
rotas da SPA. O endereço público da API fica em `public/arcana-config.js` (copiado para
raiz no build), incluindo `/api/v1`. Exemplo: `https://sua-api.example/api/v1`.
No Vercel, defina ARCANA_API_BASE_URL nas variáveis do projeto e faça novo deploy.
O vercel.json já configura saída e fallback da SPA. Em outros hosts, você também
pode editar esse arquivo sem recompilar. Por padrão usa `/api/v1` na mesma origem;
nesse caso encaminhe `/api` para o backend **antes** do fallback da SPA. Configure
CORS_ORIGINS no backend com a origem exata do frontend. HTTPS em ambos em produção.

Sessão guardada em sessionStorage por aba; fechar a aba encerra a persistência local.
Tokens são enviados apenas à URL da API configurada. Não há tokens em query strings.
Refresh simultâneo é consolidado em uma chamada e requisições são repetidas uma única vez.
O logout só é concluído após revogação no servidor; erros ficam visíveis.

## Verificar

```bash
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Os testes de navegador cobrem desktop/celular, proteção de rascunhos, corrida de sessão
após novo login e respostas HTTP sintéticas isoladas,
sem chamadas pagas. O CI instala Chromium e testa os arquivos do build de produção.
O app consulta o estado das gerações a cada 2,5s enquanto houver trabalho pendente;
interrompe ao concluir, sair da tela ou ocorrer erro. Reabrir pelo diário retoma a consulta.
SSE está disponível no backend, mas não é necessário para esse fluxo.

As artes externas já presentes foram mantidas na home como decoração. Cartas funcionais
e biblioteca usam grafismos e nomes do catálogo; não representam as ilustrações como
um baralho original. Revise direitos/disponibilidade das artes antes de publicação comercial.
