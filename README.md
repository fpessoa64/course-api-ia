<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Products API

This project includes a complete RESTful API for product management with pagination, validation, and in-memory storage.

### Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Pagination with customizable page size
- ✅ Soft delete (products are marked as inactive, not physically removed)
- ✅ Automatic validation with class-validator
- ✅ In-memory storage (data resets on server restart)
- ✅ Comprehensive test coverage (60 tests: 24 service + 14 controller + 22 e2e)
- ✅ Detailed code comments in Portuguese

### API Endpoints

#### 1. Create Product
```bash
POST /products
Content-Type: application/json

{
  "name": "Laptop Dell Inspiron",
  "description": "Professional laptop with 16GB RAM",
  "price": 4500.00,
  "stock": 10
}

# Response: 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell Inspiron",
  "description": "Professional laptop with 16GB RAM",
  "price": 4500.00,
  "stock": 10,
  "isActive": true,
  "createdAt": "2024-01-28T10:00:00.000Z",
  "updatedAt": "2024-01-28T10:00:00.000Z"
}
```

#### 2. List Products (with pagination)
```bash
GET /products?page=1&limit=10

# Response: 200 OK
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Laptop Dell Inspiron",
      "price": 4500.00,
      ...
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Query Parameters:**
- `page` (optional): Page number, default: 1, min: 1
- `limit` (optional): Items per page, default: 10, min: 1, max: 100

#### 3. Get Product by ID
```bash
GET /products/:id

# Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell Inspiron",
  ...
}

# Error: 404 Not Found
{
  "statusCode": 404,
  "message": "Product with ID \"...\" not found"
}
```

#### 4. Update Product
```bash
PATCH /products/:id
Content-Type: application/json

{
  "price": 4200.00,
  "stock": 8
}

# Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop Dell Inspiron",
  "price": 4200.00,
  "stock": 8,
  "updatedAt": "2024-01-28T11:00:00.000Z",
  ...
}
```

#### 5. Delete Product (Soft Delete)
```bash
DELETE /products/:id

# Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "isActive": false,
  ...
}
```

### Field Validations

The API automatically validates all input data:

- **name**: required, non-empty string
- **description**: optional string
- **price**: required, positive number (> 0)
- **stock**: required, integer >= 0
- **page**: optional, integer >= 1
- **limit**: optional, integer between 1-100

### Error Responses

```bash
# 400 Bad Request - Validation failed
{
  "statusCode": 400,
  "message": ["price must be a positive number"],
  "error": "Bad Request"
}

# 400 Bad Request - Extra properties not allowed
{
  "statusCode": 400,
  "message": ["property extraField should not exist"],
  "error": "Bad Request"
}

# 404 Not Found - Resource not found
{
  "statusCode": 404,
  "message": "Product with ID \"...\" not found",
  "error": "Not Found"
}
```

### Testing the API

```bash
# Start the server
npm run start:dev

# Create a product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop Dell","description":"Professional laptop","price":4500.00,"stock":10}'

# List all products
curl http://localhost:3000/products

# List products with pagination
curl "http://localhost:3000/products?page=1&limit=5"

# Get specific product (replace {id} with actual UUID)
curl http://localhost:3000/products/{id}

# Update product
curl -X PATCH http://localhost:3000/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"price":4200.00}'

# Delete product
curl -X DELETE http://localhost:3000/products/{id}
```

### Architecture

- **In-Memory Storage**: Products are stored in a private array in ProductsService
- **Soft Delete**: Deleted products are marked with `isActive: false` instead of being removed
- **UUID Generation**: Each product gets a unique UUID v4 identifier
- **Automatic Timestamps**: `createdAt` and `updatedAt` are managed automatically
- **Validation**: All requests are validated using class-validator decorators

### Important Notes

⚠️ **Data Persistence**: This implementation uses in-memory storage. All data is lost when the server restarts. This is suitable for:
- Development and testing
- Prototypes and demonstrations
- Learning and educational purposes

For production use, consider integrating a database (PostgreSQL, MongoDB, etc.) using TypeORM or Mongoose.

### Test Coverage

```bash
# Run all tests
npm test

# View coverage report
npm run test:cov
```

**Coverage Statistics:**
- Products Service: 100% coverage (24 tests)
- Products Controller: 100% coverage (14 tests)
- E2E Tests: 22 integration tests
- Total: 60 tests passing ✅

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
