# Products API - Exemplos Práticos

Exemplos completos de uso da API de Produtos.

## Índice

- [Setup Inicial](#setup-inicial)
- [Criando Produtos](#criando-produtos)
- [Listando Produtos](#listando-produtos)
- [Buscando Produtos](#buscando-produtos)
- [Atualizando Produtos](#atualizando-produtos)
- [Deletando Produtos](#deletando-produtos)
- [Casos de Uso Comuns](#casos-de-uso-comuns)
- [Tratamento de Erros](#tratamento-de-erros)

## Setup Inicial

### Iniciar o Servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run start:dev

# Modo produção
npm run start:prod
```

O servidor estará disponível em `http://localhost:3000`

### Verificar Health Check

```bash
curl http://localhost:3000

# Response: "Hello World!"
```

## Criando Produtos

### Exemplo 1: Produto Completo

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop Dell Inspiron 15",
    "description": "Laptop profissional com Intel i7, 16GB RAM, SSD 512GB",
    "price": 4500.00,
    "stock": 10
  }'
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell Inspiron 15",
  "description": "Laptop profissional com Intel i7, 16GB RAM, SSD 512GB",
  "price": 4500.00,
  "stock": 10,
  "isActive": true,
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T10:00:00.000Z"
}
```

### Exemplo 2: Produto Sem Descrição

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mouse Logitech MX Master 3",
    "price": 450.00,
    "stock": 50
  }'
```

**Response (201 Created):**
```json
{
  "id": "a3b2c1d0-e4f5-6g7h-8i9j-0k1l2m3n4o5p",
  "name": "Mouse Logitech MX Master 3",
  "price": 450.00,
  "stock": 50,
  "isActive": true,
  "createdAt": "2024-01-28T10:05:00.000Z",
  "updatedAt": "2024-01-28T10:05:00.000Z"
}
```

### Exemplo 3: Produto com Estoque Zero

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teclado Mecânico RGB",
    "description": "Teclado mecânico com switches Cherry MX Blue",
    "price": 650.00,
    "stock": 0
  }'
```

**Response (201 Created):**
```json
{
  "id": "b4c3d2e1-f5g6-h7i8-j9k0-l1m2n3o4p5q6",
  "name": "Teclado Mecânico RGB",
  "description": "Teclado mecânico com switches Cherry MX Blue",
  "price": 650.00,
  "stock": 0,
  "isActive": true,
  "createdAt": "2024-01-28T10:10:00.000Z",
  "updatedAt": "2024-01-28T10:10:00.000Z"
}
```

## Listando Produtos

### Exemplo 1: Listar Todos (Sem Paginação Explícita)

```bash
curl http://localhost:3000/products
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Laptop Dell Inspiron 15",
      "description": "Laptop profissional com Intel i7, 16GB RAM, SSD 512GB",
      "price": 4500.00,
      "stock": 10,
      "isActive": true,
      "createdAt": "2024-01-28T10:00:00.000Z",
      "updatedAt": "2024-01-28T10:00:00.000Z"
    },
    {
      "id": "a3b2c1d0-e4f5-6g7h-8i9j-0k1l2m3n4o5p",
      "name": "Mouse Logitech MX Master 3",
      "price": 450.00,
      "stock": 50,
      "isActive": true,
      "createdAt": "2024-01-28T10:05:00.000Z",
      "updatedAt": "2024-01-28T10:05:00.000Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Exemplo 2: Paginação - Primeira Página com 5 Itens

```bash
curl "http://localhost:3000/products?page=1&limit=5"
```

**Response (200 OK):**
```json
{
  "data": [
    { "id": "...", "name": "Produto 1", ... },
    { "id": "...", "name": "Produto 2", ... },
    { "id": "...", "name": "Produto 3", ... },
    { "id": "...", "name": "Produto 4", ... },
    { "id": "...", "name": "Produto 5", ... }
  ],
  "meta": {
    "total": 23,
    "page": 1,
    "limit": 5,
    "totalPages": 5
  }
}
```

### Exemplo 3: Paginação - Terceira Página

```bash
curl "http://localhost:3000/products?page=3&limit=5"
```

**Response (200 OK):**
```json
{
  "data": [
    { "id": "...", "name": "Produto 11", ... },
    { "id": "...", "name": "Produto 12", ... },
    { "id": "...", "name": "Produto 13", ... },
    { "id": "...", "name": "Produto 14", ... },
    { "id": "...", "name": "Produto 15", ... }
  ],
  "meta": {
    "total": 23,
    "page": 3,
    "limit": 5,
    "totalPages": 5
  }
}
```

## Buscando Produtos

### Exemplo 1: Buscar Produto Por ID (Sucesso)

```bash
curl http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell Inspiron 15",
  "description": "Laptop profissional com Intel i7, 16GB RAM, SSD 512GB",
  "price": 4500.00,
  "stock": 10,
  "isActive": true,
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T10:00:00.000Z"
}
```

### Exemplo 2: Buscar Produto Inexistente (Erro)

```bash
curl http://localhost:3000/products/00000000-0000-0000-0000-000000000000
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Product with ID \"00000000-0000-0000-0000-000000000000\" not found",
  "error": "Not Found"
}
```

## Atualizando Produtos

### Exemplo 1: Atualizar Apenas Preço

```bash
curl -X PATCH http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 4200.00
  }'
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell Inspiron 15",
  "description": "Laptop profissional com Intel i7, 16GB RAM, SSD 512GB",
  "price": 4200.00,
  "stock": 10,
  "isActive": true,
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T11:00:00.000Z"
}
```

### Exemplo 2: Atualizar Múltiplos Campos

```bash
curl -X PATCH http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 4000.00,
    "stock": 5,
    "description": "Laptop profissional ATUALIZADO - Última unidade!"
  }'
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell Inspiron 15",
  "description": "Laptop profissional ATUALIZADO - Última unidade!",
  "price": 4000.00,
  "stock": 5,
  "isActive": true,
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T12:00:00.000Z"
}
```

### Exemplo 3: Atualizar Estoque para Zero

```bash
curl -X PATCH http://localhost:3000/products/a3b2c1d0-e4f5-6g7h-8i9j-0k1l2m3n4o5p \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 0
  }'
```

**Response (200 OK):**
```json
{
  "id": "a3b2c1d0-e4f5-6g7h-8i9j-0k1l2m3n4o5p",
  "name": "Mouse Logitech MX Master 3",
  "price": 450.00,
  "stock": 0,
  "isActive": true,
  "createdAt": "2024-01-28T10:05:00.000Z",
  "updatedAt": "2024-01-28T13:00:00.000Z"
}
```

## Deletando Produtos

### Exemplo 1: Deletar Produto (Soft Delete)

```bash
curl -X DELETE http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell Inspiron 15",
  "description": "Laptop profissional com Intel i7, 16GB RAM, SSD 512GB",
  "price": 4200.00,
  "stock": 10,
  "isActive": false,
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T14:00:00.000Z"
}
```

### Exemplo 2: Verificar Que Produto Deletado Não Aparece

```bash
# Listar produtos
curl http://localhost:3000/products
```

**Response:** O produto deletado NÃO aparece na lista (apenas produtos com `isActive: true`)

### Exemplo 3: Tentar Buscar Produto Deletado

```bash
curl http://localhost:3000/products/550e8400-e29b-41d4-a716-446655440000
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Product with ID \"550e8400-e29b-41d4-a716-446655440000\" not found",
  "error": "Not Found"
}
```

## Casos de Uso Comuns

### Caso 1: Controle de Estoque

```bash
# 1. Criar produto com estoque inicial
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Monitor LG 27\"","price":1200.00,"stock":20}'

# 2. Vender 5 unidades (reduzir estoque)
curl -X PATCH http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"stock":15}'

# 3. Repor estoque (adicionar 10 unidades)
curl -X PATCH http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"stock":25}'

# 4. Produto esgotado
curl -X PATCH http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"stock":0}'
```

### Caso 2: Promoção de Produtos

```bash
# 1. Criar produto com preço normal
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Fone Bluetooth","price":300.00,"stock":50}'

# 2. Aplicar desconto de 20%
curl -X PATCH http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"price":240.00,"description":"PROMOÇÃO - 20% OFF!"}'

# 3. Voltar ao preço normal após promoção
curl -X PATCH http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"price":300.00,"description":"Fone Bluetooth premium"}'
```

### Caso 3: Catálogo de Produtos com Navegação

```bash
# 1. Listar primeira página (10 produtos)
curl "http://localhost:3000/products?page=1&limit=10"

# 2. Navegar para próxima página
curl "http://localhost:3000/products?page=2&limit=10"

# 3. Ver apenas 5 produtos por página
curl "http://localhost:3000/products?page=1&limit=5"

# 4. Ver muitos produtos (máximo 100)
curl "http://localhost:3000/products?page=1&limit=100"
```

## Tratamento de Erros

### Erro 1: Campo Obrigatório Ausente

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Produto sem nome",
    "stock": 10
  }'
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "Name is required and cannot be empty",
    "Price must be a number",
    "Price must be a positive number"
  ],
  "error": "Bad Request"
}
```

### Erro 2: Preço Negativo

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Inválido",
    "price": -100,
    "stock": 10
  }'
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["Price must be a positive number"],
  "error": "Bad Request"
}
```

### Erro 3: Estoque Negativo

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Inválido",
    "price": 100,
    "stock": -5
  }'
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["Stock must be at least 0"],
  "error": "Bad Request"
}
```

### Erro 4: Propriedades Extras Não Permitidas

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto",
    "price": 100,
    "stock": 10,
    "extraField": "não permitido"
  }'
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["property extraField should not exist"],
  "error": "Bad Request"
}
```

### Erro 5: Página Inválida (< 1)

```bash
curl "http://localhost:3000/products?page=0"
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["Page must be at least 1"],
  "error": "Bad Request"
}
```

### Erro 6: Limite Acima do Máximo

```bash
curl "http://localhost:3000/products?limit=200"
```

**Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": ["Limit must be at most 100"],
  "error": "Bad Request"
}
```

### Erro 7: Produto Não Encontrado

```bash
curl http://localhost:3000/products/invalid-uuid
```

**Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Product with ID \"invalid-uuid\" not found",
  "error": "Not Found"
}
```

## Notas Importantes

### Armazenamento em Memória

⚠️ **Atenção**: Esta implementação usa armazenamento em memória. Todos os dados são perdidos quando o servidor reinicia.

### IDs dos Produtos

- Cada produto recebe um UUID v4 único
- IDs são gerados automaticamente no momento da criação
- Use o ID retornado na resposta de criação para operações subsequentes

### Soft Delete

- Produtos deletados permanecem no sistema com `isActive: false`
- Não aparecem em listagens (GET /products)
- Não podem ser encontrados por ID (GET /products/:id)
- Não podem ser atualizados
- Não podem ser deletados novamente

### Paginação

- Valores padrão: `page=1`, `limit=10`
- Limite máximo: 100 itens por página
- Contadores começam em 1 (não em 0)
- Metadata inclui informações úteis para navegação
