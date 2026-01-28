# Arquitetura e Fluxos da Aplicação

Este documento descreve os fluxos de execução e a arquitetura detalhada da aplicação NestJS.

## Fluxo Principal da Aplicação

### 1. Fluxo de Inicialização (Startup Flow)

```mermaid
graph TD
    A[npm run start:dev] --> B[Node.js executa main.ts]
    B --> C[bootstrap function]
    C --> D[NestFactory.create AppModule]
    D --> E[Carrega metadata dos decorators]
    E --> F[Inicializa DI Container]
    F --> G[Escaneia @Module decorators]
    G --> H[Registra Providers AppService]
    H --> I[Registra Controllers AppController]
    I --> J[Resolve dependências]
    J --> K[Injeta AppService no AppController]
    K --> L[Configura rotas Express]
    L --> M[app.listen PORT 3000]
    M --> N[Servidor HTTP pronto]

    style A fill:#e1f5ff
    style N fill:#c8e6c9
    style F fill:#fff9c4
    style J fill:#fff9c4
```

### 2. Fluxo de Requisição HTTP (Request Flow)

```mermaid
graph LR
    A[Cliente HTTP] -->|GET /| B[Express Server]
    B --> C{Router}
    C -->|match route| D[AppController]
    D --> E[@Get handler]
    E --> F[Chama AppService]
    F --> G[getHello method]
    G --> H[Business Logic]
    H --> I[Retorna 'Hello World!']
    I --> E
    E --> D
    D --> B
    B --> A

    style A fill:#e1f5ff
    style B fill:#fff9c4
    style D fill:#ffe0b2
    style F fill:#c8e6c9
    style H fill:#f8bbd0
```

### 3. Fluxo de Injeção de Dependências

```mermaid
graph TD
    A[Application Bootstrap] --> B[DI Container Initialize]
    B --> C{Scan Modules}
    C --> D[AppModule]
    D --> E{Parse Metadata}
    E -->|providers| F[AppService]
    E -->|controllers| G[AppController]

    F --> H[@Injectable decorator]
    H --> I[Register in Container]
    I --> J[Create Instance]

    G --> K[@Controller decorator]
    K --> L[Check Dependencies]
    L -->|needs AppService| M{Resolve from Container}
    M -->|found| N[Inject via Constructor]
    N --> O[AppController Instance Ready]

    J -.->|available for injection| M

    style B fill:#fff9c4
    style I fill:#c8e6c9
    style M fill:#ffe0b2
    style O fill:#c8e6c9
```

## Fluxo Detalhado por Componente

### main.ts - Entry Point

```mermaid
sequenceDiagram
    participant CLI as npm/node
    participant Main as main.ts
    participant Factory as NestFactory
    participant App as NestApplication
    participant HTTP as HTTP Server

    CLI->>Main: Execute
    Main->>Main: Call bootstrap()
    Main->>Factory: create(AppModule)

    activate Factory
    Factory->>Factory: Load AppModule
    Factory->>Factory: Initialize DI Container
    Factory->>Factory: Register providers
    Factory->>Factory: Register controllers
    Factory->>Factory: Setup middleware
    Factory-->>Main: Return app instance
    deactivate Factory

    Main->>App: app.listen(PORT ?? 3000)

    activate App
    App->>HTTP: Bind to port 3000
    HTTP-->>App: Server started
    App-->>Main: Promise resolved
    deactivate App

    Main->>Main: Console: Listening on port 3000
```

### AppModule - Dependency Container

```mermaid
graph TD
    A[@Module Decorator] --> B[Metadata Registration]
    B --> C{Module Properties}

    C -->|imports| D[External Modules]
    C -->|controllers| E[AppController]
    C -->|providers| F[AppService]
    C -->|exports| G[Exported Providers]

    D --> H[Future: UsersModule<br/>CoursesModule, etc]

    E --> I[HTTP Route Handlers]
    I --> J[Request/Response Logic]

    F --> K[Business Logic]
    K --> L[Injectable Services]

    G --> M[Shared with other modules]

    style A fill:#e1f5ff
    style C fill:#fff9c4
    style E fill:#ffe0b2
    style F fill:#c8e6c9
```

### AppController - HTTP Layer

```mermaid
graph TD
    A[@Controller Decorator] --> B[Define base route: '/']
    B --> C[Constructor Injection]
    C --> D[Receive AppService]

    D --> E[@Get Decorator]
    E --> F[Define GET / route]
    F --> G[getHello method]

    G --> H[Call this.appService.getHello]
    H --> I[Return response]

    I --> J{Response Type}
    J -->|string| K[Return as text/html]
    J -->|object| L[Serialize to JSON]
    J -->|custom| M[Use Interceptors/Pipes]

    style A fill:#ffe0b2
    style C fill:#fff9c4
    style E fill:#e1f5ff
    style H fill:#c8e6c9
```

### AppService - Business Logic Layer

```mermaid
graph TD
    A[@Injectable Decorator] --> B[Mark as Provider]
    B --> C[Available for DI]

    C --> D[getHello Method]
    D --> E{Business Logic}

    E --> F[Process Data]
    E --> G[Call External APIs]
    E --> H[Database Operations]
    E --> I[Transform Data]

    F --> J[Return Results]
    G --> J
    H --> J
    I --> J

    J --> K[To Controller]

    style A fill:#c8e6c9
    style B fill:#fff9c4
    style E fill:#f8bbd0
```

## Fluxo de Testes

### Unit Tests Flow

```mermaid
graph TD
    A[npm test] --> B[Jest Test Runner]
    B --> C[Load *.spec.ts files]
    C --> D[app.controller.spec.ts]

    D --> E[Test.createTestingModule]
    E --> F[Create Isolated Module]
    F --> G[Register AppController]
    F --> H[Register AppService Mock]

    G --> I[Compile Module]
    H --> I

    I --> J[Get Controller Instance]
    J --> K[Execute Test Cases]

    K --> L[controller.getHello]
    L --> M[Assert Response]
    M --> N{Test Result}

    N -->|Pass| O[✓ Test Passed]
    N -->|Fail| P[✗ Test Failed]

    style B fill:#e1f5ff
    style E fill:#fff9c4
    style K fill:#ffe0b2
    style O fill:#c8e6c9
    style P fill:#ffcdd2
```

### E2E Tests Flow

```mermaid
graph TD
    A[npm run test:e2e] --> B[Jest with e2e config]
    B --> C[Load *.e2e-spec.ts]
    C --> D[app.e2e-spec.ts]

    D --> E[Test.createTestingModule]
    E --> F[Import Full AppModule]
    F --> G[Bootstrap Complete App]

    G --> H[app.init]
    H --> I[Get HTTP Server]
    I --> J[Create Supertest Instance]

    J --> K[request app.getHttpServer]
    K --> L[Send HTTP Request]
    L --> M[GET /]

    M --> N[Full Stack Processing]
    N --> O[Controller → Service]
    O --> P[Return Response]

    P --> Q[Assert Status Code]
    Q --> R[Assert Response Body]
    R --> S{All Assertions}

    S -->|Pass| T[✓ E2E Test Passed]
    S -->|Fail| U[✗ E2E Test Failed]

    T --> V[app.close]
    U --> V

    style B fill:#e1f5ff
    style G fill:#fff9c4
    style N fill:#ffe0b2
    style T fill:#c8e6c9
    style U fill:#ffcdd2
```

## Fluxo de Build e Deploy

### Build Process

```mermaid
graph LR
    A[npm run build] --> B[NestJS CLI]
    B --> C[Read nest-cli.json]
    C --> D[Read tsconfig.json]
    D --> E[TypeScript Compiler]

    E --> F[Compile src/**/*.ts]
    F --> G[Generate dist/**/*.js]
    G --> H[Generate dist/**/*.d.ts]
    H --> I[Generate source maps]

    I --> J[Delete old dist/]
    J --> K[Copy assets if any]
    K --> L[Build Complete]

    style A fill:#e1f5ff
    style E fill:#fff9c4
    style L fill:#c8e6c9
```

### Production Deployment Flow

```mermaid
graph TD
    A[Production Environment] --> B[npm install --production]
    B --> C[npm run build]
    C --> D[dist/ ready]

    D --> E[npm run start:prod]
    E --> F[node dist/main]
    F --> G[Load compiled JS]
    G --> H[Bootstrap Application]

    H --> I{Environment Check}
    I -->|Development| J[Use dev settings]
    I -->|Production| K[Use prod settings]

    K --> L[Optimized runtime]
    L --> M[Listen on PORT env]
    M --> N[Application Running]

    N --> O[Health Checks]
    O --> P[Kubernetes/Docker]
    P --> Q[Load Balancer]

    style A fill:#e1f5ff
    style C fill:#fff9c4
    style K fill:#ffe0b2
    style N fill:#c8e6c9
```

## Fluxo de Expansão com Novos Módulos

### Adding Feature Module Flow

```mermaid
graph TD
    A[nest g module users] --> B[Create users.module.ts]
    B --> C[nest g controller users]
    C --> D[Create users.controller.ts]
    D --> E[nest g service users]
    E --> F[Create users.service.ts]

    F --> G[Update users.module.ts]
    G --> H[Register Controller and Service]

    H --> I{Import in AppModule}
    I --> J[Add to imports array]
    J --> K[Module Available]

    K --> L[Define Routes]
    L --> M[@Get, @Post, @Put, @Delete]

    M --> N[Implement Service Methods]
    N --> O[Add DTOs for validation]
    O --> P[Create Entities if needed]

    P --> Q[Write Unit Tests]
    Q --> R[Write E2E Tests]
    R --> S[Feature Complete]

    style A fill:#e1f5ff
    style G fill:#fff9c4
    style K fill:#c8e6c9
    style S fill:#c8e6c9
```

## Fluxo de Requisição Completo (Detalhado)

```mermaid
sequenceDiagram
    autonumber
    participant Client
    participant Express
    participant Router
    participant Guards
    participant Interceptors
    participant Pipes
    participant Controller
    participant Service
    participant Response

    Client->>Express: HTTP Request (GET /)
    Express->>Router: Match route pattern
    Router->>Guards: Check authentication/authorization

    alt Not Authorized
        Guards-->>Client: 401/403 Error
    else Authorized
        Guards->>Interceptors: Before handler
        Interceptors->>Pipes: Transform/validate request

        alt Validation Failed
            Pipes-->>Client: 400 Bad Request
        else Validation Passed
            Pipes->>Controller: Validated DTO
            Controller->>Service: Business logic call

            activate Service
            Service->>Service: Process data
            Service->>Service: Database operations
            Service->>Service: External API calls
            Service-->>Controller: Return data
            deactivate Service

            Controller->>Interceptors: After handler
            Interceptors->>Response: Transform response
            Response->>Express: Formatted response
            Express-->>Client: HTTP Response (200 OK)
        end
    end
```

## Estrutura de Módulos Futura

```mermaid
graph TB
    AppModule[AppModule<br/>Root Module]

    AppModule --> ConfigModule[ConfigModule<br/>Environment vars]
    AppModule --> DatabaseModule[DatabaseModule<br/>TypeORM/Mongoose]
    AppModule --> AuthModule[AuthModule<br/>JWT/Passport]
    AppModule --> UsersModule[UsersModule<br/>User management]
    AppModule --> CoursesModule[CoursesModule<br/>Course management]

    AuthModule --> UsersModule
    CoursesModule --> UsersModule

    UsersModule --> UserController[UsersController]
    UsersModule --> UserService[UsersService]
    UsersModule --> UserEntity[User Entity]

    CoursesModule --> CourseController[CoursesController]
    CoursesModule --> CourseService[CoursesService]
    CoursesModule --> CourseEntity[Course Entity]

    style AppModule fill:#e1f5ff
    style ConfigModule fill:#fff9c4
    style DatabaseModule fill:#fff9c4
    style AuthModule fill:#ffe0b2
    style UsersModule fill:#c8e6c9
    style CoursesModule fill:#c8e6c9
```

## Fluxo de Dados (Data Flow)

```mermaid
graph LR
    A[Client Request] --> B[HTTP Layer<br/>Controller]
    B --> C[Business Layer<br/>Service]
    C --> D[Data Layer<br/>Repository]
    D --> E[Database]

    E --> D
    D --> C
    C --> B
    B --> F[Client Response]

    G[DTOs] -.->|Validation| B
    H[Entities] -.->|Mapping| D
    I[Pipes] -.->|Transform| B
    J[Interceptors] -.->|Modify| B

    style A fill:#e1f5ff
    style B fill:#ffe0b2
    style C fill:#c8e6c9
    style D fill:#fff9c4
    style E fill:#f8bbd0
    style F fill:#e1f5ff
```

## Middleware e Guards Flow

```mermaid
graph TD
    A[Incoming Request] --> B{Global Middleware}
    B --> C[Logger Middleware]
    C --> D[CORS Middleware]
    D --> E[Helmet Security]
    E --> F[Body Parser]

    F --> G{Route Guards}
    G -->|Auth Guard| H{Authenticated?}
    H -->|No| I[Return 401]
    H -->|Yes| J{Role Guard}

    J -->|Has Permission?| K[Continue to Controller]
    J -->|No Permission| L[Return 403]

    K --> M[Controller Handler]
    M --> N[Service Method]
    N --> O{Interceptor Transform}
    O --> P[Return Response]

    style A fill:#e1f5ff
    style G fill:#fff9c4
    style M fill:#ffe0b2
    style N fill:#c8e6c9
    style P fill:#e1f5ff
```

## Performance e Escalabilidade

### Horizontal Scaling

```mermaid
graph TD
    A[Load Balancer] --> B[NestJS Instance 1]
    A --> C[NestJS Instance 2]
    A --> D[NestJS Instance 3]

    B --> E[Shared Database]
    C --> E
    D --> E

    B --> F[Redis Cache]
    C --> F
    D --> F

    E --> G[(PostgreSQL/MongoDB)]
    F --> H[(Session Store)]

    style A fill:#e1f5ff
    style B fill:#c8e6c9
    style C fill:#c8e6c9
    style D fill:#c8e6c9
    style E fill:#fff9c4
    style F fill:#ffe0b2
```

## Observabilidade

```mermaid
graph LR
    A[NestJS App] --> B[Logger Service]
    A --> C[Health Endpoint]
    A --> D[Metrics]

    B --> E[Winston/Pino]
    E --> F[Log Aggregator]

    C --> G[/health endpoint]
    G --> H[Kubernetes Probes]

    D --> I[Prometheus Metrics]
    I --> J[Grafana Dashboard]

    style A fill:#c8e6c9
    style E fill:#fff9c4
    style G fill:#ffe0b2
    style I fill:#e1f5ff
```
