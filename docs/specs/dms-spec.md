# Especificação - Document Management System

## 1. Objetivo

Entregar um sistema web que permita enviar, listar e baixar documentos, com gestão simples por usuário e armazenamento local da aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos do usuário
- Download de documentos pelo identificador
- Gestão simples por usuário (cada documento tem um dono)

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Banco de dados persistente (metadados ficam em memória nesta fase)
- Autenticação completa (login, senha, JWT)
- Edição e exclusão de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                                                               |
| ----- | --------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento via `POST /upload`                                   |
| RF-02 | O usuário pode listar os documentos de que é dono via `GET /documents`                  |
| RF-03 | O usuário pode baixar um documento pelo identificador via `GET /documents/:id/download` |
| RF-04 | O sistema rejeita o envio sem arquivo, com mensagem em português                        |
| RF-05 | O sistema rejeita o download de documento inexistente ou de outro dono (404)            |
| RF-06 | O frontend exibe lista de documentos, formulário de upload e botão de download          |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                            |
| ------ | ------------------------------------------------------------------------------------ |
| RNF-01 | Arquivos gravados em `backend/storage` via `multer` com `diskStorage`                |
| RNF-02 | Metadados mantidos em memória nesta fase                                             |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor), incluindo porta e tamanho máximo |
| RNF-04 | Tamanho máximo de upload configurável, padrão 10 MB                                  |
| RNF-05 | Erros tratados nos limites: entrada HTTP e leitura/escrita de arquivos               |
| RNF-06 | Backend em CommonJS com testes via `node:test`                                       |
| RNF-07 | Frontend em React + Vite (ESM), comunicação via `fetch` com prefixo `/api`           |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                                          |
| ------------ | ------ | -------------------------------------------------- |
| id           | string | Identificador único (UUID)                         |
| originalName | string | Nome original do arquivo enviado                   |
| storedName   | string | Nome do arquivo gravado em `backend/storage`       |
| mimeType     | string | Tipo MIME informado no upload                      |
| size         | number | Tamanho em bytes                                   |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                     |
| owner        | string | Identificador do usuário dono (header `X-User-Id`) |

## 6. Contratos de API

Prefixo no frontend: `/api` (proxy Vite). Identificação do usuário por header `X-User-Id` (obrigatório).

### POST /upload

- Entrada: `multipart/form-data`, campo `file`
- Sucesso: `201` com metadados do documento
- Erros: `400` (sem arquivo), `401` (sem `X-User-Id`), `413` (acima do limite)

### GET /documents

- Saída: `200` com array de metadados dos documentos do usuário
- Erros: `401` (sem `X-User-Id`)

### GET /documents/:id/download

- Saída: `200` com conteúdo binário e cabeçalho `Content-Disposition` com `originalName`
- Erros: `401` (sem `X-User-Id`), `404` (inexistente ou de outro dono)

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples, com fluxo `routes -> controllers -> services -> repositories`
- Camadas internas não conhecem camadas externas
- `multer` com `diskStorage` para gravação em `backend/storage`
- Metadados em repositório em memória
- Frontend baseado em componentes (`components/`, `pages/`, `services/`)
- Sem TypeScript, sem provedores de armazenamento externos

## 8. Plano de execução

1. Definir variáveis de ambiente e configuração central (porta, limite de upload, pasta de storage).
2. Implementar repositório em memória de documentos (`repositories/`).
3. Implementar serviço de documentos com regras de dono e de 404 (`services/`).
4. Configurar `multer` com `diskStorage` e middleware de `X-User-Id` (`routes/` e `controllers/`).
5. Implementar `POST /upload`, `GET /documents` e `GET /documents/:id/download`.
6. Tratar erros nos limites (400, 401, 404, 413) e respostas em português.
7. Escrever testes em `backend/test` com `node:test` cobrindo os três endpoints.
8. Implementar frontend: serviço `fetch` em `services/`, componentes de upload e lista, página principal.
9. Validar fluxo ponta a ponta (upload, listagem, download) e revisar contra os RF e RNF.

### Decisões em aberto

- Identificação do usuário: header `X-User-Id` simples (recomendado) ou JWT simples.
- Limite de upload: 10 MB padrão, configurável por variável de ambiente.
