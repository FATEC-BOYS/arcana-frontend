# Arquitetura e experiência

Rotas lazy por funcionalidade, componentes standalone, Signals para estado visual e
HttpClient/RxJS para APIs. Sem estado global adicional nesta etapa.

Direção de arte: fantasia ornamental, preto violeta, rubi e dourado antigo, geometria
celestial e tipografia editorial. Referências de skins Arcana do LoL orientam atmosfera;
nenhuma imagem ou personagem da Riot integra o projeto. Ornamentos são CSS autoral.

Planejado: TarotCard, CardTable, ReadingProgress, InterpretationPanel, SourceDrawer,
ReadingChat e JournalEntry. Implementados: shell, carta demonstrativa e páginas básicas.

Backend sorteia/persiste; frontend revela. Contrato de autenticação/SSE deve ser fechado
antes de implementar sessão, guards e streaming. Não usar guards como autorização real.
Não persistir perguntas em URLs, logs ou analytics. Não renderizar HTML arbitrário do LLM.

Acessibilidade: botões nativos, foco visível, skip link, status de revelação, movimento
reduzido. Validar contraste, leitores de tela, teclado e dispositivos na implementação final.
