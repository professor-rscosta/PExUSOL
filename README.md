# ☀️ Usina do Sol — Sistema Multiempresa

> Plataforma de e-commerce solidário para associações do Território Velho Chico  
> **UNEB / Projeto Usina do Sol — DCHT**

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração do Banco (XAMPP)](#-configuração-do-banco-xampp)
- [Instalação e Execução](#-instalação-e-execução)
- [Credenciais de Acesso](#-credenciais-de-acesso)
- [Rotas da API](#-rotas-da-api)
- [Deploy na Hostinger](#-deploy-na-hostinger)
- [Associações Cadastradas](#-associações-cadastradas)

---

## 🎯 Visão Geral

Sistema **multi-tenant** de vendas online para:

| Associação | Segmento | Slug |
|---|---|---|
| Mangal | Artesanato / Colares | `/empresa/mangal` |
| AEBSV | Mel / Extrativismo | `/empresa/aebsv` |
| Candeiro | Hortaliças / Orgânicos | `/empresa/candeiro` |

**Fluxo do cliente:** Acessa a loja → Escolhe produtos → Finaliza via WhatsApp ✅  
**Sem necessidade de login para comprar.**

---

## 🛠 Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TanStack Query |
| Backend | Node.js + Express |
| ORM | Prisma |
| Banco | MySQL (XAMPP) |
| Auth | JWT |
| Estilo | Tailwind CSS |
| Integração | WhatsApp via wa.me |

---

## 📁 Estrutura do Projeto

```
usina-do-sol/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos do banco
│   │   └── seed.js             # Dados iniciais
│   ├── src/
│   │   ├── controllers/        # authController, empresaController...
│   │   ├── middleware/         # auth.js, upload.js
│   │   ├── routes/             # index.js (todas as rotas)
│   │   └── server.js           # Entrada da aplicação
│   ├── uploads/                # Imagens enviadas (gerado auto)
│   ├── .env                    # Variáveis de ambiente
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/                # axios.js (instância com JWT)
    │   ├── components/         # Layouts Admin e Vendedor
    │   ├── contexts/           # AuthContext, CarrinhoContext
    │   ├── pages/
    │   │   ├── admin/          # Dashboard, Empresas, Usuários...
    │   │   ├── loja/           # LojaEmpresa, Carrinho, Checkout...
    │   │   └── vendedor/       # Dashboard, Produtos, Pedidos, Relatório
    │   ├── utils/              # Formatações e helpers
    │   └── App.jsx             # Rotas da aplicação
    └── package.json
```

---

## 🔧 Pré-requisitos

Instale antes de começar:

- [Node.js 18+](https://nodejs.org) — `node -v` para verificar
- [XAMPP](https://www.apachefriends.org) — MySQL + Apache
- [VS Code](https://code.visualstudio.com)
- [Git](https://git-scm.com)

---

## 🗄 Configuração do Banco (XAMPP)

### 1. Inicie o XAMPP
Abra o XAMPP Control Panel e inicie:
- ✅ **Apache** (porta 80)
- ✅ **MySQL** (porta 3306)

### 2. Crie o banco de dados
Acesse: http://localhost/phpmyadmin

```sql
CREATE DATABASE usina_do_sol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure o usuário (opcional)
Por padrão o XAMPP usa `root` sem senha. Se precisar criar:
```sql
CREATE USER 'usina'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON usina_do_sol.* TO 'usina'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🚀 Instalação e Execução

### Passo 1 — Clone o repositório
```bash
git clone https://github.com/seu-usuario/usina-do-sol.git
cd usina-do-sol
```

### Passo 2 — Configure o Backend

```bash
cd backend
```

Copie o arquivo de variáveis de ambiente:
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edite o `.env`:
```env
DATABASE_URL="mysql://root:@localhost:3306/usina_do_sol"
JWT_SECRET="usina_sol_chave_super_secreta_2026"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

> ⚠️ Se seu MySQL tiver senha, use: `mysql://root:SUASENHA@localhost:3306/usina_do_sol`

Instale as dependências:
```bash
npm install
```

Execute as migrations do Prisma (cria as tabelas):
```bash
npx prisma migrate dev --name init
```

Popule o banco com dados iniciais:
```bash
npm run seed
```

Inicie o servidor:
```bash
npm run dev
```

✅ Backend rodando em: **http://localhost:3001**

---

### Passo 3 — Configure o Frontend

Abra um **novo terminal**:
```bash
cd frontend
npm install
npm run dev
```

✅ Frontend rodando em: **http://localhost:5173**

---

### Passo 4 — Acesse o sistema

| URL | Descrição |
|---|---|
| http://localhost:5173 | Página inicial |
| http://localhost:5173/empresa/mangal | Loja Mangal |
| http://localhost:5173/empresa/aebsv | Loja AEBSV |
| http://localhost:5173/empresa/candeiro | Loja Candeiro |
| http://localhost:5173/login | Login Admin/Vendedor |
| http://localhost:5173/admin | Painel Admin |
| http://localhost:5173/vendedor | Painel Vendedor |

---

## 🔑 Credenciais de Acesso

| Perfil | E-mail | Senha |
|---|---|---|
| **Admin (UNEB)** | admin@usinado.sol | admin123 |
| Vendedor Mangal | vendedor@mangal.com | vendedor123 |
| Vendedor AEBSV | vendedor@aebsv.com | vendedor123 |
| Vendedor Candeiro | vendedor@candeiro.com | vendedor123 |

> ⚠️ **Troque as senhas** antes de publicar em produção!

---

## 📡 Rotas da API

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/perfil` | Perfil do usuário logado |
| PUT | `/api/auth/senha` | Alterar senha |

### Empresas (Público)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/empresas` | Listar empresas ativas |
| GET | `/api/empresas/:slug` | Dados de uma empresa |

### Produtos (Público)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/empresa/:slug/produtos` | Produtos da loja |
| GET | `/api/produtos/:id` | Detalhe do produto |
| GET | `/api/produtos/busca?q=` | Busca global |

### Pedidos (Público)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/empresa/:slug/pedidos` | Criar pedido (checkout) |

### Admin (requer JWT + role ADMIN)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/admin/dashboard` | Dashboard global |
| GET/POST | `/api/admin/empresas` | CRUD empresas |
| GET/POST | `/api/admin/usuarios` | CRUD usuários |
| GET/POST | `/api/admin/categorias` | CRUD categorias |
| GET | `/api/admin/produtos` | Todos produtos |
| GET | `/api/admin/relatorio` | Relatório global |

### Vendedor (requer JWT)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/empresa/:slug/pedidos` | Pedidos da empresa |
| PATCH | `/api/pedidos/:id/status` | Atualizar status |
| GET | `/api/empresa/:slug/relatorio` | Relatório da empresa |

---

## 🌐 Deploy na Hostinger

### Requisitos no plano Hostinger
- Plano **Business** ou superior (suporta Node.js)
- Banco MySQL incluído

---

### 1. Prepare o Backend

```bash
# Na pasta backend, gere o build do Prisma
npx prisma generate
```

Crie o arquivo `ecosystem.config.js` na pasta `backend/`:
```js
module.exports = {
  apps: [{
    name: 'usina-do-sol-api',
    script: 'src/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
```

---

### 2. Configure o banco no painel Hostinger

1. Acesse **hPanel → Banco de Dados MySQL**
2. Crie um banco: `usina_sol`
3. Crie um usuário e anote: host, nome, senha
4. Importe as migrations via phpMyAdmin

---

### 3. Faça o upload via FTP ou GitHub

**Via GitHub (recomendado):**
1. Suba o código no GitHub
2. No hPanel, use **Git** para clonar o repositório
3. Execute `npm install` no servidor via terminal SSH

---

### 4. Configure as variáveis no servidor

No hPanel → **Node.js** → **Variáveis de Ambiente**:
```
DATABASE_URL=mysql://usuario:senha@localhost:3306/usina_sol
JWT_SECRET=chave_producao_super_secreta
PORT=3001
FRONTEND_URL=https://seudominio.com
```

---

### 5. Build do Frontend

```bash
cd frontend
npm run build
```

Copie a pasta `dist/` para `public_html/` no servidor Hostinger.

---

### 6. Configure o proxy reverso (Apache)

Crie/edite o arquivo `.htaccess` em `public_html/`:
```apache
Options -MultiViews
RewriteEngine On

# Redireciona /api/* para o backend Node.js
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# React Router — redireciona tudo para index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

### 7. Inicie o servidor Node.js

No terminal SSH da Hostinger:
```bash
cd /home/usuario/backend
npm install --production
npx prisma migrate deploy
npm run seed
pm2 start ecosystem.config.js
pm2 save
```

---

## 📱 Integração WhatsApp

O checkout gera um link `wa.me` com a mensagem completa:

```
wa.me/5577999999999?text=
🛒 *NOVO PEDIDO — Usina do Sol*

📋 Protocolo: PED-2026-0001
📅 Data: 27/04/2026 às 14:30
👤 Cliente: João Silva
📱 Telefone: (77) 99999-9999

🛍️ *ITENS:*
• 2x Colar Artesanal — R$ 40,00
• 1x Mel Silvestre 500g — R$ 25,00

💰 *TOTAL: R$ 65,00*
🚚 Entrega no endereço
```

Para alterar o número do WhatsApp de cada associação, edite os dados no painel Admin → Empresas.

---

## 🔒 Segurança em Produção

- [ ] Troque `JWT_SECRET` por uma chave forte aleatória
- [ ] Troque todas as senhas do seed
- [ ] Use HTTPS (SSL gratuito na Hostinger)
- [ ] Configure CORS apenas para seu domínio
- [ ] Ative rate limiting no backend

---

## 👥 Equipe

**Projeto Usina do Sol**  
Universidade do Estado da Bahia — UNEB  
Departamento de Ciências Humanas e Tecnologias (DCHT)

---

## 📄 Licença

MIT — Uso livre para fins educacionais e sociais.
