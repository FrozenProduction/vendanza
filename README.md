# Vendanza · Ent'Artes — plataforma de gestão de escola de dança

Aplicação web para gerir uma escola de dança: modalidades e tipos de aula, horários, estúdios,
inscrições, pagamentos, presenças, inventário e alugueres — com portais separados para encarregados
de educação, professores e direção.

Projeto da unidade curricular **Projeto Aplicado (50+10)** — Licenciatura em Engenharia de Sistemas
Informáticos, Escola Superior de Tecnologia / UPCA, 1.º semestre de 2025/26.

## Estado

- **Frontend e backend funcionais** (entrega concluída na unidade curricular).
- **Demo:** https://vendanza.appwrite.network/ — frontend publicado no Appwrite Sites. A base de dados
  **já não está em execução** (os serviços gratuitos usados expiraram e exigiam pagamento), por isso na
  demo o *login* e os dados não funcionam; as páginas carregam.
- O painel da direção continua em HTML legado (ver *Dívida técnica*).

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java + Spring Boot (Web, Data JPA, Security), PostgreSQL, **JWT** (jjwt), **bcrypt** (jbcrypt) |
| Frontend | React 19 + Vite 6 + React Router 7 (SPA); painel da direção em HTML/JS |
| Base de dados | PostgreSQL — 23 tabelas; estrutura e dados de exemplo em `vendanza-frontend/db.sql` |

## Estrutura do repositório

```
vendanza/
├── vendanza-backend/            # API REST (Spring Boot)
│   ├── src/main/java/com/vendanza/backend/
│   │   ├── controllers/         # endpoints /api/*
│   │   ├── services/            # regras de negócio
│   │   ├── repositories/        # Spring Data JPA
│   │   ├── models/              # entidades (Aula, Inscrição, Pagamento, …)
│   │   ├── dto/                 # pedidos/respostas da API
│   │   └── security/            # filtros JWT e configuração
│   └── src/main/resources/      # application*.properties (config por ambiente)
└── vendanza-frontend/           # SPA React + painel HTML
    ├── src/                     # pages, components, api, context, hooks
    ├── css/ · imagens/          # estilos e recursos partilhados
    ├── admin/                   # painel da direção (HTML legado)
    └── db.sql                   # estrutura + dados de exemplo da base de dados
```

## Como executar

### Backend

1. Criar uma base de dados PostgreSQL e carregar `vendanza-frontend/db.sql`.
2. Copiar `vendanza-backend/src/main/resources/application-example.properties` para
   `application.properties` e preencher (ou definir `DB_URL`, `DB_USER`, `DB_PASSWORD`).
3. Correr:

```bash
cd vendanza-backend
./mvnw spring-boot:run        # http://localhost:8080
```

### Frontend

```bash
cd vendanza-frontend
npm install
npm run dev                   # http://localhost:5173
```

## API REST

Todos os recursos seguem o mesmo formato: `GET` (listar), `GET /{id}` (detalhe), `POST /guardar`
(criar), `PUT /{id}` (atualizar), `DELETE /eliminar/{id}` (remover).

| Recurso | Descrição |
|---|---|
| `/api/utilizadores` | utilizadores e perfis (encarregado, professor, direção) |
| `/api/modalidade` | modalidades de dança |
| `/api/tipos-aula` | tipos de aula |
| `/api/aulas` | aulas, com listagem por aluno e por encarregado |
| `/api/aulas-privadas` | aulas privadas |
| `/api/horario` | horários |
| `/api/estudios` | estúdios e alugueres |
| `/api/inscricoes` | inscrições |
| `/api/pagamentos` | pagamentos |
| `/api/presencas` | presenças |
| `/api/inventario` | inventário e equipamento |
| `/api/verificar` | verificação de sessão/autenticação |

## Segurança

- Autenticação por **JWT**; palavras-passe guardadas com **bcrypt** (nunca em texto simples).
- A configuração da base de dados **lê as credenciais de variáveis de ambiente** — nenhuma password
  pertence ao repositório. `application.properties` está no `.gitignore`; usa-se
  `application-example.properties` como modelo.

## Autores

Equipa de 5 — Licenciatura em Engenharia de Sistemas Informáticos, EST/UPCA:

- Afonso Peixoto Macedo
- Bruno Alexandre Moreira de Paiva
- Diogo Rafael Araújo Pereira
- Tiago Barroso Fontes
- Vitor Daniel Costa Moreira

## Dívida técnica conhecida

- O painel da direção (`vendanza-frontend/admin/`) é HTML/JS legado: foi mantido por âmbito, o núcleo
  do utilizador está todo em React.
- `db.sql` é um *dump* com sintaxe MySQL (`ENGINE=InnoDB`) embora o backend use PostgreSQL — o import
  precisa de ajuste (remover `ENGINE=InnoDB` e conferir os tipos).
- Configuração pensada para um serviço gratuito (porta dinâmica via `PORT`, pool HikariCP reduzido).
