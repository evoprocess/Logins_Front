# Sistema de Logins — Frontend

Interface de login multiempresa construída com HTML, CSS, JavaScript e Vite.

## Responsabilidade do frontend

O frontend:

1. Solicita organização, login e senha.
2. Normaliza a organização em maiúsculas.
3. Envia os dados exclusivamente ao backend por HTTPS.
4. Exibe os erros devolvidos pela API.
5. Armazena o JWT em `sessionStorage` após o sucesso.
6. Exibe “Login realizado com sucesso”.
7. Remove o JWT quando o usuário clica em **Sair**.

O frontend não recebe as configurações `DADOS_FIREBASE_*`, não consulta diretamente o Firestore e não monta o e-mail interno. Essas responsabilidades pertencem ao backend.

## Fluxo completo

```text
Frontend
   │ organização + login + senha
   ▼
Backend no Render
   │ monta org_XXXX-login@sislogin.com.br
   ▼
Firebase Auth central
   ▼
Firestore central: logins_geral/ORG_XXXX
   │ valida organização e login ativos
   ▼
Firebase Auth da organização
   ▼
JWT de sessão
   ▼
Frontend: login realizado com sucesso
```

O mesmo e-mail interno e a mesma senha devem existir no Auth central e no Auth da organização correspondente.

## Requisitos

- Node.js 20 ou superior;
- backend em execução;
- URL pública do backend.

## Variável de ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Para produção:

```env
VITE_API_URL=https://logins-back.onrender.com
```

Não coloque barra no final. Somente variáveis prefixadas com `VITE_` ficam disponíveis no código do navegador. Nunca coloque `SESSION_SECRET` ou `DADOS_FIREBASE_*` neste projeto.

## Execução local

Instale as dependências:

```bash
npm install
```

Inicie o Vite:

```bash
npm run dev
```

Por padrão, a aplicação estará disponível em:

```text
http://localhost:5173
```

No backend, inclua essa origem em `FRONTEND_URL`:

```env
FRONTEND_URL=http://localhost:5173
```

## Contrato com o backend

O formulário envia:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "organization": "ORG_0001",
  "login": "dev.admin",
  "password": "senha-do-usuario"
}
```

Em caso de sucesso, o backend devolve:

```json
{
  "token": "jwt-da-sessao",
  "expiresIn": 28800,
  "message": "Login realizado com sucesso.",
  "organization": {
    "id": "ORG_0001",
    "name": "Empresa 0001"
  },
  "user": {
    "login": "dev.admin"
  }
}
```

O token é salvo com a chave:

```text
login_session
```

Como o armazenamento é `sessionStorage`, o token é eliminado quando a sessão da aba é encerrada. Rotas protegidas futuras deverão enviá-lo ao backend no cabeçalho:

```http
Authorization: Bearer <token>
```

## Build de produção

```bash
npm run build
```

Os arquivos finais são gerados em `dist`.

Para testar o build localmente:

```bash
npm run preview
```

## GitHub Pages

O projeto está configurado para publicação em:

```text
https://evoprocess.github.io/Logins_Front/
```

O `vite.config.js` usa:

```js
base: '/Logins_Front/'
```

O workflow `.github/workflows/pages.yml` executa automaticamente:

1. `npm ci`;
2. `npm run build`;
3. publicação do diretório `dist`.

No GitHub, configure **Settings → Pages → Source** como **GitHub Actions**.

No Render, a origem permitida deve ser:

```env
FRONTEND_URL=https://evoprocess.github.io
```

Não use `/Logins_Front/` nessa variável.

## Estrutura

```text
.
├── .github/workflows/pages.yml
├── src
│   ├── main.js
│   └── style.css
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Segurança

- A senha é enviada somente ao backend usando HTTPS.
- Nenhuma configuração Firebase fica no frontend.
- O JWT não deve ser colocado em URLs ou logs.
- O botão **Sair** remove o JWT da sessão do navegador.
- A autenticação e as autorizações definitivas sempre são realizadas pelo backend e pelos projetos Firebase.
