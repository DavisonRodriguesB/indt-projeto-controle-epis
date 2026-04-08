# INDT - Projeto Controle de EPIs

Sistema Full Stack para controle de entrega, validade e estoque de Equipamentos de Proteção Individual (EPIs), desenvolvido como projeto final da trilha Full Stack.

## 🚀 Tecnologias
- Angular
- Node.js
- Express
- PostgreSQL
- Tailwind CSS

## 📂 Estrutura do Projeto
/backend → API e regras de negócio  
/frontend → Interface da aplicação  

## 📌 Objetivo
Digitalizar o controle de EPIs, garantindo rastreabilidade, conformidade com a NR-6 e gestão eficiente de estoque e validade.

## ✅ Foco Inicial: Backend
Este repositório agora possui uma base funcional do backend em Node.js + Express + TypeScript com PostgreSQL.

### O que foi implementado
- API REST para EPIs (`GET`, `GET/:id`, `POST`, `PUT/:id`, `DELETE/:id`)
- Health check em `/api/health`
- Conexao com PostgreSQL usando `pg`
- Persistencia com TypeORM (entidades em `backend/src/entities`)
- Validacao de payload com `zod`
- Tratamento centralizado de erros
- Migrations simples para criar tabela `epis`
- Sincronizacao de schema via TypeORM
- Autenticacao com JWT e perfis (`admin`, `almoxarife`)
- Modulo de colaboradores e entregas de EPI
- Alertas de validade e estoque minimo

### Banco com Docker
No diretorio raiz existe um unico `docker-compose.yml` para subir PostgreSQL + API backend.

1. Entrar na pasta raiz do projeto.
2. Subir banco + backend:
	`docker compose up -d`
3. Ver logs do backend (opcional):
  `docker compose logs -f backend`

API disponivel em `http://localhost:3333/api`.

### Rodar o backend sem Docker (modo desenvolvimento)
Se preferir rodar so o banco no Docker e a API localmente:

1. Subir apenas o banco:
  `docker compose up -d postgres`
2. Ainda em `backend`, criar arquivo `.env` com base no `.env.example`
3. Instalar dependencias:
  `npm install`
4. Rodar em desenvolvimento:
  `npm run dev`

API disponivel em `http://localhost:3333/api`.

### Testes unitarios (Jest)
Na pasta `backend`:

1. Rodar todos os testes:
  `npm test`
2. Rodar em modo watch:
  `npm run test:watch`
3. Gerar cobertura:
  `npm run test:coverage`

### Usuario admin padrao
O backend cria automaticamente um usuario admin na primeira execucao da migration:
- Email: `ADMIN_DEFAULT_EMAIL` (padrao: `admin@controle-epis.local`)
- Senha: `ADMIN_DEFAULT_PASSWORD` (padrao: `admin123`)

### Endpoints principais
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me` (autenticado)
- `POST /api/auth/users` (admin)

Cadastros base (`admin`/`almoxarife`):
- `GET /api/cargos`
- `POST /api/cargos`
- `PUT /api/cargos/:id`
- `GET /api/setores`
- `POST /api/setores`
- `PUT /api/setores/:id`
- `GET /api/categorias`
- `POST /api/categorias`
- `PUT /api/categorias/:id`

Catalogo de EPIs:
- `GET /api/epis?page=1&pageSize=20`
- `GET /api/epis/:id`
- `POST /api/epis` (admin)
- `PUT /api/epis/:id` (admin)
- `POST /api/epis/entrada-saldo` (admin/almoxarife)
- `POST /api/epis/:id/entrada-saldo` (admin/almoxarife)

Colaboradores:
- `GET /api/colaboradores`
- `POST /api/colaboradores` (admin/almoxarife)
- `PUT /api/colaboradores/:id` (admin/almoxarife)
- `DELETE /api/colaboradores/:id` (admin/almoxarife) - desativacao logica (`status=false`)

Movimentacoes:
- `POST /api/movimentacoes/entrega` (admin/almoxarife)
- `POST /api/movimentacoes/entrada-saldo` (admin/almoxarife)

Consultas:
- `GET /api/consultas/entregas` (admin/almoxarife)

Legado ainda disponivel:
- `GET /api/entregas`
- `POST /api/entregas` (admin/almoxarife)
- `GET /api/alertas?diasValidade=30`

### Padrao de resposta
Sucesso:
```json
{
  "data": {},
  "meta": {}
}
```

Erro:
```json
{
  "code": "ERROR_CODE",
  "message": "Mensagem do erro",
  "details": null
}
```

Observacoes:
- `meta` e opcional e hoje e usado principalmente em listagens.
- Em erro de validacao (`zod`), `details` traz os campos invalidos.

### Exemplo de login
Request:
```json
{
  "email": "admin@controle-epis.local",
  "senha": "admin123"
}
```

Response:
```json
{
  "data": {
    "token": "<jwt>",
    "user": {
      "id": 1,
      "nome": "Administrador",
      "email": "admin@controle-epis.local",
      "role": "admin"
    }
  }
}
```

Use o token em `Authorization: Bearer <jwt>`.

### Exemplo de payload (POST /api/epis e PUT /api/epis/:id)
```json
{
  "codigo": "CAP-001",
  "nome": "Capacete de Seguranca",
  "ca": "12345",
  "categoriaId": 1,
  "vidaUtilDias": 365,
  "ativo": true,
  "validade": "2027-12-31",
  "estoqueAtual": 100,
  "estoqueMinimo": 20
}
```

### Exemplo de payload (POST /api/colaboradores)
```json
{
  "nome": "Joao da Silva",
  "matricula": "MAT-001",
  "cargoId": 1,
  "setorId": 1,
  "status": true
}
```

### Exemplo de payload (POST /api/movimentacoes/entrega)
```json
{
  "colaboradorId": 1,
  "itens": [
    {
      "epiId": 1,
      "quantidade": 2
    }
  ],
  "dataMovimentacao": "2026-04-07",
  "observacao": "Entrega inicial"
}
```

### Exemplo de payload (POST /api/movimentacoes/entrada-saldo)
```json
{
  "itens": [
    {
      "epiId": 1,
      "quantidade": 10
    }
  ],
  "dataMovimentacao": "2026-04-07",
  "observacao": "Reposicao"
}
```

### Exemplo de filtros (GET /api/consultas/entregas)
- `colaborador_id`
- `matricula`
- `epi_id`
- `ca`
- `data_inicio` e `data_fim` (obrigatoriamente juntos, intervalo maximo de 31 dias)
- `mes` (`YYYY-MM`)
- `usuario_id`

### Exemplo de resposta (GET /api/epis)
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Capacete de Seguranca",
      "ca": "12345",
      "validade": "2027-12-31",
      "estoque_atual": 100,
      "estoque_minimo": 20,
      "created_at": "2026-03-21T12:00:00.000Z",
      "updated_at": "2026-03-21T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1
  }
}
```
