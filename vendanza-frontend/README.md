# Vendanza / Ent'Artes — Frontend

**Licenciatura em Engenharia de Sistemas Informáticos 2025-26**

## Alunos

| Número | Nome |
|--------|------|
| 31554 | Afonso Peixoto Macedo |
| 31496 | Bruno Alexandre Moreira de Paiva |
| 31513 | Diogo Rafael Araújo Pereira |
| 33222 | Tiago Barroso Fontes |
| 31553 | Vitor Daniel Costa Moreira |

**[Link Marcação de Reuniões](https://docs.google.com/spreadsheets/d/1cNqsofkvsYwQ07qQgf7_qgByrmv2Yk62aFtWXOHQYrc/edit?usp=sharing)**

---

## Stack

- **React 19** + **Vite 6**
- **React Router 7** (SPA)
- API REST: `https://vendanza-api.onrender.com`

## Como executar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build
npm run preview
```

---

## O que é React e o que não é

| Parte | Tecnologia | Pasta / entrada |
|-------|------------|-----------------|
| Site público, login, portal aluno, portal professor | **React** | `src/` + `index.html` |
| Estilos e imagens partilhados | CSS estático | `css/`, `imagens/` |
| Painel da direção (administração) | **HTML legado** (ainda não migrado) | `admin/` |

O ficheiro **`index.html` na raiz não é uma página antiga** — é a entrada obrigatória do Vite (onde o React é montado em `<div id="root">`). **Não apagar.**

---

## Estrutura do projeto

```
vendanza-frontend/
  index.html          # Entrada Vite (shell da SPA React)
  src/
    api/              # Cliente HTTP
    context/          # Autenticação, notificações
    components/       # UI reutilizável
    pages/            # Rotas React
    hooks/            # Lógica partilhada
    styles/           # Imports para css/
  css/                # Folhas de estilo (usadas pelo React)
  imagens/            # Logótipos, fundos, ícones
  admin/              # Painel direção (HTML + backendadmin.js)
```

---

## Rotas React (entrega principal)

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/escola` | A escola |
| `/login` | Autenticação |
| `/portal` | Dashboard encarregado de educação |
| `/professor` | Dashboard professor |
| `/admin/*` | Redireciona para o painel HTML em `admin/` |

Rotas antigas (`/dashboard.html`, `/login.html`, etc.) redirecionam automaticamente para as rotas React em `src/App.jsx`.

---

## Contas de teste (exemplo)

Usar utilizadores criados na base de dados do projeto. Após login:

- Encarregado → `/portal`
- Professor → `/professor`
- Direção → `/admin/admindashboard.html`

---

## Repositório backend

A API está no repositório **`vendanza-backend`** (Spring Boot). O frontend consome essa API; ambos devem ser referenciados na entrega final.

---

## Notas para a entrega

1. Entregar o repositório **`vendanza-frontend`** com `npm install` e `npm run dev` a funcionar.
2. Mencionar na documentação que o **painel admin** (`admin/`) permanece em HTML por âmbito do projeto; o núcleo utilizador está em React.
3. Opcional: incluir capturas de ecrã das rotas `/`, `/login`, `/portal`, `/professor`.
4. Não incluir `node_modules/` no ZIP — apenas código-fonte + `package.json`.
