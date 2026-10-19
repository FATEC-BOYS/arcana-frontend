# Navegador

Execute `npm run build`, `npx playwright install chromium` e `npm test`.
A suíte serve o build em localhost:4200 e intercepta somente a API com fixtures sintéticas.
Testa desktop e viewport de celular em Chromium. Não comprova disponibilidade do backend,
SMTP ou qualidade de interpretação. O CI do backend verifica banco e contratos próprios.

A suíte também verifica descarte protegido de notas (rotas internas e filtros)
e se uma resposta 401 atrasada após logout/novo login preserva a nova sessão.
O navegador pode disparar um aviso nativo ao sair com alterações não salvas;
rascunhos não são mantidos após descarte confirmado ou fechamento da aba.
