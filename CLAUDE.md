# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS TypeScript API project (course-api-ia) currently in starter/scaffold phase. The project follows standard NestJS architectural patterns with a modular design ready for feature expansion.

## Essential Commands

### Development
```bash
npm run start:dev    # Start dev server with hot reload
npm run start:debug  # Start with debug inspector enabled
npm run start        # Start without watch mode
npm run start:prod   # Run compiled production build
```

### Build
```bash
npm run build        # Compile TypeScript to dist/
```

### Testing
```bash
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage report
npm run test:e2e     # Run end-to-end tests
npm run test:debug   # Run tests with debugger attached
```

### Code Quality
```bash
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
```

## Architecture Overview

### NestJS Module Pattern

The application follows NestJS's modular architecture with dependency injection:

- **Entry Point** ([src/main.ts](src/main.ts)): Bootstraps the application using `NestFactory.create(AppModule)`, listens on port 3000 (or `PORT` env var)
- **Root Module** ([src/app.module.ts](src/app.module.ts)): Declares controllers, providers, and imports using `@Module()` decorator
- **Controllers** ([src/app.controller.ts](src/app.controller.ts)): Handle HTTP requests/responses using route decorators (`@Get()`, `@Post()`, etc.)
- **Services** ([src/app.service.ts](src/app.service.ts)): Contain business logic, marked with `@Injectable()` for DI

### Dependency Injection Flow

```
main.ts → AppModule → AppController → AppService
```

## Sequence Diagrams

### Application Startup Sequence

```mermaid
sequenceDiagram
    participant Runtime as Node.js Runtime
    participant Main as main.ts
    participant Factory as NestFactory
    participant Module as AppModule
    participant Controller as AppController
    participant Service as AppService

    Runtime->>Main: Execute bootstrap()
    Main->>Factory: NestFactory.create(AppModule)
    Factory->>Module: Load @Module metadata
    Module->>Controller: Register AppController
    Module->>Service: Register AppService (provider)
    Factory->>Controller: Inject AppService via constructor
    Factory-->>Main: Return app instance
    Main->>Main: app.listen(PORT ?? 3000)
    Main-->>Runtime: Server listening on port 3000
```

### HTTP Request/Response Flow

```mermaid
sequenceDiagram
    participant Client as HTTP Client
    participant Express as Express Server
    participant Controller as AppController
    participant Service as AppService

    Client->>Express: GET / HTTP/1.1
    Express->>Controller: Route to @Get() handler
    Controller->>Service: this.appService.getHello()
    Service->>Service: Execute business logic
    Service-->>Controller: return "Hello World!"
    Controller-->>Express: return response data
    Express-->>Client: HTTP/1.1 200 OK<br/>Body: "Hello World!"
```

### Dependency Injection Container Flow

```mermaid
sequenceDiagram
    participant Factory as NestFactory
    participant Container as DI Container
    participant Module as AppModule
    participant Controller as AppController
    participant Service as AppService

    Factory->>Container: Initialize
    Container->>Module: Scan @Module() metadata
    Module-->>Container: providers: [AppService]
    Module-->>Container: controllers: [AppController]

    Container->>Service: Instantiate AppService
    Note over Service: @Injectable() marked

    Container->>Controller: Instantiate AppController
    Controller->>Container: Request AppService dependency
    Container-->>Controller: Inject AppService instance

    Container-->>Factory: All dependencies resolved
```

### Unit Test Execution Flow

```mermaid
sequenceDiagram
    participant Jest as Jest Test Runner
    participant Test as app.controller.spec.ts
    participant TestModule as Test.createTestingModule
    participant Controller as AppController
    participant MockService as Mock AppService

    Jest->>Test: Execute test suite
    Test->>TestModule: createTestingModule({...})
    TestModule->>Controller: Create controller instance
    TestModule->>MockService: Create mock service
    TestModule->>Controller: Inject mock service
    TestModule-->>Test: Return compiled module

    Test->>Controller: controller.getHello()
    Controller->>MockService: this.appService.getHello()
    MockService-->>Controller: return "Hello World!"
    Controller-->>Test: return result

    Test->>Test: expect(result).toBe("Hello World!")
    Test-->>Jest: Assertion passed ✓
```

### E2E Test Execution Flow

```mermaid
sequenceDiagram
    participant Jest as Jest Test Runner
    participant E2ETest as app.e2e-spec.ts
    participant TestModule as Test.createTestingModule
    participant App as Full Application
    participant Supertest as Supertest Client

    Jest->>E2ETest: Execute e2e suite
    E2ETest->>TestModule: createTestingModule({<br/>  imports: [AppModule]<br/>})
    TestModule->>App: Bootstrap complete app
    TestModule-->>E2ETest: Return app instance

    E2ETest->>App: app.init()
    E2ETest->>Supertest: request(app.getHttpServer())

    Supertest->>App: GET /
    App->>App: Process through full stack<br/>(Controller → Service)
    App-->>Supertest: HTTP 200 "Hello World!"

    Supertest-->>E2ETest: Response object
    E2ETest->>E2ETest: expect(200)<br/>expect(/Hello World!/)
    E2ETest-->>Jest: All assertions passed ✓

    E2ETest->>App: app.close()
```

## Project Structure

### Current Structure
```
src/
├── main.ts              # Application entry point
├── app.module.ts        # Root module
├── app.controller.ts    # Root controller (GET / endpoint)
├── app.service.ts       # Root service
└── app.controller.spec.ts  # Unit tests

test/
├── app.e2e-spec.ts     # E2E tests
└── jest-e2e.json       # E2E Jest configuration
```

### Recommended Structure for Feature Expansion
```
src/
├── main.ts
├── app.module.ts
├── users/                    # Feature module example
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.controller.spec.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   └── entities/
│       └── user.entity.ts
├── courses/                  # Feature module example
│   ├── courses.module.ts
│   ├── courses.controller.ts
│   ├── courses.service.ts
│   └── dto/
└── common/                   # Shared utilities
    ├── filters/              # Exception filters
    ├── guards/               # Auth guards
    ├── interceptors/         # Request/response interceptors
    ├── pipes/                # Validation pipes
    └── decorators/           # Custom decorators
```

## Adding New Features

When adding new features, follow NestJS conventions:

### 1. Generate Module Structure
```bash
nest generate module users
nest generate controller users
nest generate service users
```

### 2. Create DTOs for Validation
```typescript
// users/dto/create-user.dto.ts
export class CreateUserDto {
  name: string;
  email: string;
}
```

### 3. Update Module
```typescript
// users/users.module.ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // Export if used by other modules
})
export class UsersModule {}
```

### 4. Import in AppModule
```typescript
// app.module.ts
@Module({
  imports: [UsersModule],  // Add new module here
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 5. Implement Controller
```typescript
// users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

### 6. Implement Service
```typescript
// users/users.service.ts
@Injectable()
export class UsersService {
  findAll() {
    // Business logic here
  }

  create(createUserDto: CreateUserDto) {
    // Business logic here
  }
}
```

## TypeScript Configuration

- **Target**: ES2023 with modern JavaScript features
- **Module System**: nodenext (native ESM support)
- **Decorators**: Enabled (required for NestJS `@Injectable()`, `@Controller()`, etc.)
- **Strict Mode**: strictNullChecks enabled, noImplicitAny disabled for flexibility
- **Output**: `./dist` directory

## Testing Strategy

### Unit Tests
- Use `Test.createTestingModule()` to create isolated testing modules
- Mock dependencies using Jest
- Test files: `*.spec.ts`

```typescript
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should return "Hello World!"', () => {
    expect(appController.getHello()).toBe('Hello World!');
  });
});
```

### E2E Tests
- Bootstrap full application
- Test HTTP endpoints with supertest
- Test files: `*.e2e-spec.ts`

```typescript
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

## Common Development Patterns

### Controllers
- Keep controllers thin - delegate business logic to services
- Use DTOs for request/response validation
- Use proper HTTP status codes and decorators

### Services
- Contain business logic and data access
- Should be framework-agnostic when possible
- Use dependency injection for dependencies

### Modules
- Organize by feature (users, courses, etc.)
- Export providers that other modules need
- Keep modules focused and cohesive

## CI/CD

The project includes GitHub Actions workflows:
- **Claude Code Review**: Automated PR reviews
- **Claude PR Assistant**: @claude mention support in PRs

## Technology Stack

- **Framework**: NestJS v11.0.1
- **HTTP Adapter**: Express
- **Runtime**: Node.js (ES2023 target)
- **Language**: TypeScript 5.7.3
- **Testing**: Jest 30.0.0 with ts-jest
- **Code Quality**: ESLint 9.18.0 + Prettier 3.4.2
- **Port**: 3000 (configurable via `PORT` env var)

## Environment Configuration

Currently uses environment variables:
- `PORT`: Server port (default: 3000)

For more complex configuration, consider adding `@nestjs/config`:
```bash
npm install @nestjs/config
```

## Next Steps for Expansion

Common additions for production apps:
- Database integration (`@nestjs/typeorm`, `@nestjs/mongoose`)
- Authentication (`@nestjs/jwt`, `@nestjs/passport`)
- API documentation (`@nestjs/swagger`)
- Configuration management (`@nestjs/config`)
- Logging (`@nestjs/winston`, `nestjs-pino`)
- Global error handling (Exception Filters)
- Request validation (`class-validator`, `class-transformer`)
- Rate limiting (`@nestjs/throttler`)
- CORS configuration
- Health checks (`@nestjs/terminus`)
