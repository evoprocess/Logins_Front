# Sistema de Logins — Frontend

Configure `VITE_API_URL`, execute `npm install` e `npm run dev`. Para produção, use `npm run build` e publique `dist`.
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
| **Region** | Virginia (US East) |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

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

Exemplo:

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

Como o Firebase Authentication exige um e-mail, o sistema gera automaticamente um e-mail interno.

Exemplo:

```text
ORG_0001-bia.santos@sistema.com.br
```

Esse e-mail existe apenas para autenticação e nunca é exibido ao usuário.

---

# Fluxo Completo de Login

```text
Usuário

↓

Organização
Login
Senha

↓

Sistema gera

ORG_0001-bia.santos@sistema.com.br

↓

Firebase Authentication

↓

Autenticou?

├── Não
│
│   ↓
│
│ Erro de login
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

A variável do Render

```text
DADOS_FIREBASE_LOGINS_GERAL
```

utiliza o seguinte Firestore:

```text
logins_geral (coleção)

└── ORG_0001 (documento)

      status_ativo_org: true

      logins_org (map)

          bia.santos (map)

              status_ativo_login: true

          grazielle.carvalho (map)

              status_ativo_login: true

└── ORG_0002

      status_ativo_org: true

      logins_org (map)

          joao.silva (map)

              status_ativo_login: true

          maria.souza (map)

              status_ativo_login: false
```

---

# Significado da Estrutura

| Campo | Tipo | Descrição |
|--------|------|-----------|
| `logins_geral` | Coleção | Banco central de autenticação |
| `ORG_0001` | Documento | Organização (Tenant) |
| `status_ativo_org` | Boolean | Organização habilitada |
| `logins_org` | Map | Logins pertencentes à organização |
| `bia.santos` | Map | Representa um login |
| `status_ativo_login` | Boolean | Define se o login está ativo |

---

# Processo de Validação

O backend executa a seguinte sequência:

1. Autentica no Firebase Authentication.
2. Consulta a coleção `logins_geral`.
3. Localiza a organização.
4. Verifica `status_ativo_org`.
5. Procura o login informado.
6. Verifica `status_ativo_login`.
7. Identifica a organização.
8. Carrega as credenciais da organização.
9. Conecta ao banco de dados correspondente.
10. Cria a sessão do usuário.

---

# Mapeamento das Organizações

O Render possui o mapeamento das organizações.

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

Sistema Liberado
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

Sistema Liberado
```

---

# Banco de Dados da Organização

Após a autenticação, o usuário deixa de utilizar o Firebase Central.

Toda a aplicação passa a utilizar apenas o banco da empresa.

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

Não armazena dados operacionais.

---

## Backend (Render)

Responsável por:

- Validar autenticação.
- Validar organização.
- Carregar as variáveis de ambiente.
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
- Relatórios
- Configurações
- Documentos
- Permissões
- Dados operacionais

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

DADOS_FIREBASE_ORG_0001

↓

Firebase / Banco da Empresa

↓

Sessão Criada

↓

Sistema Liberado
```

---

# Benefícios da Arquitetura

- ✅ Um único projeto Firebase para autenticação.
- ✅ Um único banco central de logins.
- ✅ Isolamento completo entre organizações.
- ✅ Cada empresa possui seu próprio banco de dados.
- ✅ Escalabilidade para milhares de organizações.
- ✅ Credenciais protegidas no backend.
- ✅ Nenhuma credencial sensível é enviada ao frontend.
- ✅ Arquitetura Multi-Tenant.
- ✅ Fácil expansão para novas organizações.
- ✅ Alta segurança com separação entre autenticação e dados operacionais.
