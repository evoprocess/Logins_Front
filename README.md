O banco de dados de login será único para todas as organizações.
Após todas as validações do login terá acesso aos dados do banco de dados no backend
Cada organização terá seu banco de dados individual.

Campos da tela de login:
              ▼
Organização
              ▼
Login
              ▼
Senha
              ▼

              │
              ▼
Gera o e-mail "fake" do Firebase

ORG_0001-ana.santos@sistema.com.br

              │
              ▼
Projeto Firebase CENTRAL
(Apenas Auth + Firestore de logins)

              │
              ▼
Firebase Auth

              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
Falhou             Autenticou
      │                │
      ▼                ▼
Erro           Consulta Firestore

                logins
                   │
                   ▼
              ORG_0001
                   │
                   ▼
             ana.santos
                   │
                   ▼
           Documento existe?

             Não → Acesso negado

                   │
                   ▼
            ativo == true ?

             Não → Acesso negado

                   │
                   ▼
          Todas as validações OK

                   │
                   ▼
      Render recebe a requisição

                   │
                   ▼
    Render identifica a organização

                   │
                   ▼
 Obtém as credenciais do projeto/banco
        da ORG_0001

                   │
                   ▼
      Cria a sessão da aplicação

                   │
                   ▼
 Agora o usuário pode acessar
 os dados reais da organização


-----------------------------------------------

Fase 2 — Liberação

Somente depois que tudo foi aprovado:

Render

↓

"Este usuário pertence à ORG_0001."

↓

Obtém a configuração da ORG_0001

↓

Conecta ao projeto/banco da ORG_0001

↓

Libera o sistema

-----------------------------------------------

Modelo no Firebase Central apenas com informações de autenticação e autorização:

logins

ORG_0001
    ana.santos
         status ativo

-----------------------------------------------

Render com o mapeamento das organizações:

ORG_0001
    projeto_firebase: empresa_1
    banco: postgres_empresa_1

ORG_0002
    projeto_firebase: empresa_2
    banco: postgres_empresa_2

-----------------------------------------------

Banco de dados da Organização

   logins_org (coleção)
       ana.santos (documento) OBS representa o login
           perfil
           cargo
           nome
           telefone
           etc...

-----------------------------------------------

Resumo

FLUXO DE LOGIN:

BANCO DE DADOS DE "logins" GERAL (FIRESTORE PARA AUTENTICAR E VALIDAR A ORGANIZAÇÃO)
↓
RENDER (BACKEND PARA OBTER OS DADOS DA ORGANIZAÇÃO)
↓
BANCO DE DADOS DA EMPRESA (FIRESTORE COMPLETO DA EMPRESA INCLUSIVE "logins_org")
