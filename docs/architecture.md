# Arquitetura do frontend

Angular standalone, signals e formulários; rotas carregadas sob demanda. ArcanaService
centraliza HTTP, sessão, perfil, erros e refresh single-flight. A API configurável tem base
fixa: caminhos de recursos e tokens não são enviados para endereços recebidos de respostas.
Guard de navegação exige sessão local; o backend aplica a autorização efetiva.

Tokens opacos são mantidos em memória e sessionStorage. Não há uso de localStorage,
HTML de respostas ou bypass de sanitização. Resultados/fontes são interpolados como texto.
O mapa SVG é apresentado em contexto de imagem com URL de Blob, revogada ao trocar/sair.
Tokens de recuperação saem da barra de endereço assim que o formulário os consome.

Criações de leitura/mensagem preservam a chave de idempotência em tentativas do mesmo
formulário. Alterar a pergunta cria nova intenção. Polling de geração usa 2,5s, cancela ao
sair e descarta respostas antigas ao trocar de leitura. Não persiste perguntas em storage.

O diário combina histórico paginado de leituras com anotação da leitura selecionada.
Favoritas são paginadas pelo endpoint de diário. A mesma anotação é acessível na mesa.
Sem sincronização de rascunhos: salvar explicitamente antes de trocar de página.

## Áreas de navegação

PublicLayout contém início, biblioteca, cadastro, login e recuperação de acesso.
PrivateLayout agrupa `/app/diario`, `/app/leitura`, `/app/mapa`, `/app/mesa/:id`
e `/app/conta`. O pai e seus filhos usam authGuard. GuestGuard encaminha sessões
existentes de login/cadastro para o diário. Login respeita returnUrl da rota protegida.
Os menus são próprios de cada layout; o formulário de perfil exige modo profile privado.
URLs antigas de leitura/mapa/diário/mesa redirecionam para /app; /conta preserva a
compatibilidade, levando visitantes a /cadastro e sessões existentes a /app/conta.
O backend continua responsável por autenticar e autorizar cada requisição.
