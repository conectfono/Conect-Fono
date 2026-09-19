# CONECT FONO

Plataforma acadêmica e comunitária para estudantes, professores e profissionais de Fonoaudiologia.

A CONECT FONO reúne conteúdos, oportunidades, ciência, projetos, eventos e uma loja da comunidade em uma única plataforma.

## Tecnologias

- HTML, CSS e JavaScript
- Supabase
- Supabase Auth
- PostgreSQL
- Row Level Security (RLS)
- Supabase Storage

## Funcionalidades

### Usuários

- Criação de conta
- Login e logout
- Sessão persistente
- Perfis de estudante e professor
- Área pessoal
- Consulta das próprias inscrições
- Cancelamento das próprias inscrições

### Eventos

- Eventos públicos
- Criação e edição pelo administrador
- Exclusão de eventos pelo administrador
- Destaque de eventos
- Inscrição de usuários autenticados
- Cancelamento de inscrição
- Proteção contra inscrição duplicada

### Conteúdos

A plataforma possui quatro áreas:

- **Conteúdos** — acesso exclusivo para usuários autenticados
- **Oportunidades** — acesso exclusivo para usuários autenticados
- **Ciência & Pesquisa** — área pública
- **Projetos** — área pública

Os conteúdos podem ser publicados, editados e excluídos pelo administrador.

Também é possível utilizar imagens de capa armazenadas no Supabase Storage.

### Loja

A loja é pública para visitantes.

O administrador pode:

- cadastrar produtos;
- editar produtos;
- substituir imagens;
- remover produtos;
- gerenciar informações de preço, descrição e WhatsApp.

As imagens dos produtos são armazenadas no Supabase Storage.

## Segurança

A plataforma utiliza Row Level Security (RLS) no banco de dados.

As principais regras incluem:

- usuários só podem acessar seus próprios dados pessoais;
- usuários só podem gerenciar suas próprias inscrições;
- administradores possuem permissões administrativas;
- conteúdos privados exigem autenticação;
- conteúdos públicos permanecem acessíveis sem login;
- produtos ativos podem ser visualizados publicamente;
- alterações de produtos são restritas ao administrador;
- arquivos administrativos do Storage são protegidos por políticas de acesso.

## Banco de dados

Os principais recursos armazenados no Supabase incluem:

- `profiles`
- `events`
- `enrollments`
- `products`
- `content_entries`
- `user_consents`
- `audit_logs`

O projeto também utiliza funções e políticas do PostgreSQL para controle de acesso e regras da aplicação.

## Configuração

A aplicação utiliza as credenciais públicas do projeto Supabase através da configuração do site.

A chave pública do Supabase pode ser utilizada no frontend conforme as políticas RLS configuradas no banco.

**Não coloque chaves secretas, service role keys, senhas administrativas ou outras credenciais privadas no código público ou neste README.**

## Desenvolvimento

Para desenvolvimento local, abra os arquivos do projeto através de um servidor local ou hospede-os em um serviço compatível com páginas estáticas.

A aplicação depende da configuração correta do Supabase para autenticação, banco de dados e armazenamento.

## Estrutura principal

```text
/
├── index.html
├── app.js
├── styles.css
├── hub.css
├── eventos.html
├── eventos.js
├── portal.html
├── portal.js
├── loja.html
├── loja.js
├── supabase-config.js
├── assets/
└── README.md
