# Arquitetura de Autenticação Multiempresa (Multi-Tenant)

## Objetivo

O sistema utiliza uma arquitetura **Multi-Tenant**, onde existe apenas **um banco de autenticação central**, responsável por validar usuários e organizações.

Após todas as validações, o backend identifica automaticamente a organização do usuário e conecta ao banco de dados correspondente.

---

# Arquitetura Geral

```text
                           Usuário

                               │
                               ▼

                    Organização | Login | Senha

                               │
                               ▼

                  Firebase Central (Auth)

                               │
                               ▼

             Firestore Central (logins_geral)

                               │
                               ▼

               Todas as validações aprovadas

                               │
                               ▼

                 Backend (Render / Node.js)

                               │
                               ▼

          Identifica a organização (Tenant)

                               │
                               ▼

      Carrega as credenciais da organização

                               │
                               ▼

       Conecta ao banco da organização

                               │
                               ▼

                  Sistema liberado
```

---

# Configuração do Render

## Serviço

| Configuração | Valor |
|--------------|--------|
| Region | Virginia (US East) |
| Branch | `main` |
| Build Command | `npm install` |
| Start Command | `npm start` |

---

# Variáveis de Ambiente

## Firebase Central

```text
DADOS_FIREBASE_LOGINS_GERAL
```

Responsável por:

- Firebase Authentication
- Firestore Central
- Autenticação
- Autorização

---

## Organizações

Cada organização possui sua própria variável.

Exemplo:

```text
DADOS_FIREBASE_ORG_0001
DADOS_FIREBASE_ORG_0002
DADOS_FIREBASE_ORG_0003
...
```

Exemplo de conteúdo:

```json
{
  "org": "ORG_0001",
  "nome_org": "Empresa ABC",

  "IMGBB_API_KEY": "XXXXXXXXXXXXXXXX",

  "CLOUDINARY_URL_API_KEY": "cloudinary://XXXX:YYYY@ZZZZ",

  "apiKey": "xxxxxxxx",
  "authDomain": "xxxxxxxx",
  "projectId": "xxxxxxxx",
  "storageBucket": "xxxxxxxx",
  "messagingSenderId": "xxxxxxxx",
  "appId": "xxxxxxxx"
}
```

---

# Tela de Login

O usuário informa apenas:

- Organização
- Login
- Senha

Exemplo:

| Campo | Valor |
|--------|-------|
| Organização | ORG_0001 |
| Login | bia.santos |
| Senha | ******** |

---

# Geração do E-mail do Firebase

O Firebase Authentication exige um endereço de e-mail.

Como o usuário utiliza login em vez de e-mail, o sistema gera automaticamente um e-mail interno.

Exemplo:

```text
ORG_0001-bia.santos@sistema.com.br
```

Esse e-mail existe apenas para autenticação no Firebase.

---

# Fluxo Completo de Login

```text
Usuário

↓

Informa:

• Organização
• Login
• Senha

↓

Sistema gera automaticamente

ORG_0001-bia.santos@sistema.com.br

↓

Firebase Authentication

↓

Autenticou?

├── Não
│      ↓
│   Erro de login
│
└── Sim

↓

Firestore Central

↓

Coleção:

logins_geral

↓

Documento

ORG_0001

↓

status_ativo_org == true ?

↓

Existe login?

↓

status_ativo_login == true ?

↓

Todas as validações aprovadas

↓

Backend (Render)

↓

Obtém as credenciais da organização

↓

Conecta ao banco da organização

↓

Cria a sessão

↓

Sistema liberado
```

---

# Estrutura do Firestore Central

A variável

```text
DADOS_FIREBASE_LOGINS_GERAL
```

representa o projeto Firebase responsável apenas pela autenticação.

Sua estrutura é:

```text
logins_geral (coleção)

└── ORG_0001 (documento)

      status_ativo_org: true

      logins_org (map)

          bia.santos

              status_ativo_login: true

          grazielle.carvalho

              status_ativo_login: true

└── ORG_0002

      status_ativo_org: true

      logins_org

          joao.silva

              status_ativo_login: true

          maria.souza

              status_ativo_login: false
```

---

# Significado da Estrutura

| Campo | Tipo | Descrição |
|--------|------|-----------|
| logins_geral | Coleção | Coleção principal de autenticação |
| ORG_0001 | Documento | Representa uma organização |
| status_ativo_org | Boolean | Define se a organização pode utilizar o sistema |
| logins_org | Map | Lista de logins da organização |
| bia.santos | Map | Representa um login |
| status_ativo_login | Boolean | Define se o login está ativo |

---

# Processo de Validação

O backend realiza a seguinte sequência:

1. Autentica no Firebase Authentication.
2. Consulta a coleção `logins_geral`.
3. Localiza a organização.
4. Verifica `status_ativo_org`.
5. Localiza o login.
6. Verifica `status_ativo_login`.
7. Identifica a organização.
8. Obtém as credenciais da organização.
9. Conecta ao banco da organização.
10. Cria a sessão.

---

# Mapeamento das Organizações

O Render identifica automaticamente a organização.

Exemplo:

```text
ORG_0001

↓

Projeto Firebase

empresa_1

↓

Banco

Firestore Empresa 1

↓

Sistema liberado
```

Outro exemplo:

```text
ORG_0002

↓

Projeto Firebase

empresa_2

↓

Banco

Firestore Empresa 2

↓

Sistema liberado
```

---

# Banco da Organização

Depois da autenticação, o usuário deixa de utilizar o Firebase Central.

Toda a aplicação passa a utilizar exclusivamente o banco da organização.

Exemplo:

```text
Firestore Empresa 1

logins_org

    bia.santos

        nome
        cargo
        perfil
        telefone
        email
        foto

clientes

produtos

pedidos

financeiro

relatórios

configurações

...
```

Esse banco contém **todos os dados operacionais** da empresa.

---

# Separação de Responsabilidades

## Firebase Central

Responsável apenas por:

- Authentication
- Login
- Senha
- Organização
- Autorização
- Status da organização
- Status do login

Não armazena dados da empresa.

---

## Backend (Render)

Responsável por:

- Validar o login.
- Identificar a organização.
- Ler as variáveis de ambiente.
- Obter as credenciais da organização.
- Criar a sessão.
- Conectar ao banco correto.

---

## Banco da Organização

Responsável por armazenar:

- Usuários
- Clientes
- Produtos
- Financeiro
- Configurações
- Documentos
- Relatórios
- Permissões
- Demais informações da empresa

---

# Fluxo Resumido

```text
               LOGIN

Usuário

↓

Organização
Login
Senha

↓

Firebase Authentication

↓

Firestore Central

↓

Validação da Organização

↓

Validação do Login

↓

Backend (Render)

↓

Obtém DADOS_FIREBASE_ORG_0001

↓

Conecta ao Firebase/Banco da Empresa

↓

Cria Sessão

↓

Sistema Liberado
```

---

# Benefícios da Arquitetura

- Um único projeto Firebase para autenticação.
- Um único banco central de logins.
- Isolamento total entre organizações.
- Cada empresa possui seu próprio banco de dados.
- Escalabilidade para milhares de organizações.
- Credenciais protegidas no backend.
- Nenhuma credencial sensível é enviada ao frontend.
- Fácil manutenção e expansão da plataforma.
- Arquitetura Multi-Tenant profissional.
- Segurança elevada com separação entre autenticação e dados operacionais.
