# Arcana Frontend 🔮

Fundação Angular standalone + TypeScript + CDK para uma experiência de tarot.
Backend: https://github.com/FATEC-BOYS/arcana-backend

## Estado

Navegação, home responsiva, formulário validado, tentativa de leitura de tipos de tiragem
via API e mesa visual com símbolos fixos. A mesa é explicitamente demonstrativa:
não sorteia, não gera interpretações e não persiste dados. Perguntas não saem do formulário.
Biblioteca, autenticação, diário e conta exibem estados de implementação pendente.
CDK está disponível como base; ainda não há interações que necessitem suas primitivas.

## Executar

Node 22.12+ ou 24; Angular 21.

```bash
npm ci
npm start -- --proxy-config proxy.conf.json
```

Abra http://localhost:4200. API local esperada em http://localhost:8000/api/v1.
Sem API, a interface mostra indisponibilidade e mantém a prévia visual.

```bash
npm run typecheck
npm run build
```

Defina API_BASE_URL em src/app/app.config.ts ou use proxy reverso para /api.
O servidor de produção precisa retornar index.html para rotas da SPA e encaminhar /api
antes desse fallback. Nunca colocar chaves de LLM no frontend.

Lockfile incluído para instalações reproduzíveis com npm ci. Não há suíte automatizada de UI nesta fundação.
Consulte docs/architecture.md e docs/roadmap.md.
