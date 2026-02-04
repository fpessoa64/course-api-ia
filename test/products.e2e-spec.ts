import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from './../src/app.module';

/**
 * Suite de testes E2E (End-to-End) para a API de Produtos.
 *
 * Testa toda a stack da aplicação:
 * - HTTP server
 * - Routing
 * - Controllers
 * - Services
 * - Validation
 * - Serialização JSON
 *
 * Usa supertest para fazer requisições HTTP reais.
 * Cada teste é independente e isolado.
 *
 * Cobertura:
 * - CRUD completo de produtos
 * - Paginação
 * - Validação de dados
 * - Tratamento de erros
 * - Soft delete
 */
describe('Products API (e2e)', () => {
  let app: INestApplication;

  /**
   * Setup executado antes de todos os testes.
   * Bootstrap completo da aplicação, igual ao main.ts.
   */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configura ValidationPipe (igual ao main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  /**
   * Cleanup executado após todos os testes.
   * Fecha a aplicação e libera recursos.
   */
  afterAll(async () => {
    await app.close();
  });

  /**
   * Testes do endpoint POST /products
   */
  describe('POST /products', () => {
    /**
     * Deve criar um novo produto com sucesso.
     */
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Laptop Dell Inspiron',
          description: 'Professional laptop with 16GB RAM',
          price: 4500.0,
          stock: 10,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Laptop Dell Inspiron');
          expect(res.body.description).toBe(
            'Professional laptop with 16GB RAM',
          );
          expect(res.body.price).toBe(4500.0);
          expect(res.body.stock).toBe(10);
          expect(res.body.isActive).toBe(true);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    /**
     * Deve criar produto sem descrição (campo opcional).
     */
    it('should create a product without description', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Mouse Logitech',
          price: 50.0,
          stock: 100,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Mouse Logitech');
          expect(res.body.description).toBeUndefined();
          expect(res.body.price).toBe(50.0);
        });
    });

    /**
     * Deve rejeitar criação sem campos obrigatórios.
     */
    it('should reject creation without required fields', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          description: 'Missing required fields',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeInstanceOf(Array);
          expect(res.body.statusCode).toBe(400);
        });
    });

    /**
     * Deve rejeitar criação com preço negativo.
     */
    it('should reject creation with negative price', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Invalid Product',
          price: -100,
          stock: 10,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Price must be a positive number',
          );
        });
    });

    /**
     * Deve rejeitar criação com stock negativo.
     */
    it('should reject creation with negative stock', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Invalid Product',
          price: 100,
          stock: -5,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Stock must be at least 0');
        });
    });

    /**
     * Deve rejeitar propriedades extras (forbidNonWhitelisted).
     */
    it('should reject extra properties', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product',
          price: 100,
          stock: 10,
          extraField: 'should be rejected',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'property extraField should not exist',
          );
        });
    });
  });

  /**
   * Testes do endpoint GET /products
   */
  describe('GET /products', () => {
    /**
     * Deve retornar lista paginada de produtos.
     */
    it('should return paginated list of products', async () => {
      // Cria alguns produtos para teste
      await request(app.getHttpServer()).post('/products').send({
        name: 'Product 1',
        price: 100,
        stock: 10,
      });

      await request(app.getHttpServer()).post('/products').send({
        name: 'Product 2',
        price: 200,
        stock: 20,
      });

      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
          expect(res.body.meta).toHaveProperty('totalPages');
        });
    });

    /**
     * Deve respeitar parâmetros de paginação.
     */
    it('should respect pagination parameters', async () => {
      return request(app.getHttpServer())
        .get('/products?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });

    /**
     * Deve validar query params (page >= 1).
     */
    it('should validate page parameter (min 1)', () => {
      return request(app.getHttpServer())
        .get('/products?page=0')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Page must be at least 1');
        });
    });

    /**
     * Deve validar query params (limit <= 100).
     */
    it('should validate limit parameter (max 100)', () => {
      return request(app.getHttpServer())
        .get('/products?limit=200')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Limit must be at most 100');
        });
    });

    /**
     * Deve usar valores padrão quando query params não fornecidos.
     */
    it('should use default pagination values', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
        });
    });
  });

  /**
   * Testes do endpoint GET /products/:id
   */
  describe('GET /products/:id', () => {
    /**
     * Deve retornar produto quando encontrado.
     */
    it('should return a product by id', async () => {
      // Cria produto para teste
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 100,
          stock: 10,
        });

      const productId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(productId);
          expect(res.body.name).toBe('Test Product');
          expect(res.body.price).toBe(100);
        });
    });

    /**
     * Deve retornar 404 quando produto não existe.
     */
    it('should return 404 when product not found', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      return request(app.getHttpServer())
        .get(`/products/${nonExistentId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe(
            `Product with ID "${nonExistentId}" not found`,
          );
        });
    });
  });

  /**
   * Testes do endpoint PATCH /products/:id
   */
  describe('PATCH /products/:id', () => {
    /**
     * Deve atualizar produto existente.
     */
    it('should update an existing product', async () => {
      // Cria produto para teste
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Original Product',
          price: 100,
          stock: 10,
        });

      const productId = createResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({
          price: 120,
          stock: 8,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(productId);
          expect(res.body.name).toBe('Original Product'); // Não alterado
          expect(res.body.price).toBe(120); // Atualizado
          expect(res.body.stock).toBe(8); // Atualizado
        });
    });

    /**
     * Deve atualizar apenas campos fornecidos.
     */
    it('should update only provided fields', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          description: 'Original description',
          price: 100,
          stock: 10,
        });

      const productId = createResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({
          price: 120,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Test Product'); // Não alterado
          expect(res.body.description).toBe('Original description'); // Não alterado
          expect(res.body.price).toBe(120); // Atualizado
          expect(res.body.stock).toBe(10); // Não alterado
        });
    });

    /**
     * Deve retornar 404 quando produto não existe.
     */
    it('should return 404 when product not found', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      return request(app.getHttpServer())
        .patch(`/products/${nonExistentId}`)
        .send({ price: 100 })
        .expect(404);
    });

    /**
     * Deve validar dados na atualização.
     */
    it('should validate update data', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          price: 100,
          stock: 10,
        });

      const productId = createResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({
          price: -50, // Inválido
        })
        .expect(400);
    });
  });

  /**
   * Testes do endpoint DELETE /products/:id
   */
  describe('DELETE /products/:id', () => {
    /**
     * Deve deletar produto (soft delete).
     */
    it('should soft delete a product', async () => {
      // Cria produto para teste
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product to Delete',
          price: 100,
          stock: 10,
        });

      const productId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(productId);
          expect(res.body.isActive).toBe(false);
        });
    });

    /**
     * Deve retornar 404 quando produto não existe.
     */
    it('should return 404 when product not found', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      return request(app.getHttpServer())
        .delete(`/products/${nonExistentId}`)
        .expect(404);
    });

    /**
     * Produto deletado não deve aparecer em listagens.
     */
    it('should not list deleted product', async () => {
      // Cria produto
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product to Delete',
          price: 100,
          stock: 10,
        });

      const productId = createResponse.body.id;

      // Deleta produto
      await request(app.getHttpServer()).delete(`/products/${productId}`);

      // Verifica que não aparece em listagens
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          const productInList = res.body.data.find(
            (p: any) => p.id === productId,
          );
          expect(productInList).toBeUndefined();
        });
    });

    /**
     * Produto deletado não deve ser encontrado por GET /products/:id.
     */
    it('should return 404 when trying to get deleted product', async () => {
      // Cria produto
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Product to Delete',
          price: 100,
          stock: 10,
        });

      const productId = createResponse.body.id;

      // Deleta produto
      await request(app.getHttpServer()).delete(`/products/${productId}`);

      // Tenta buscar produto deletado
      return request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });
  });

  /**
   * Teste de fluxo completo CRUD
   */
  describe('Full CRUD flow', () => {
    /**
     * Deve completar fluxo completo de CRUD.
     */
    it('should complete full CRUD workflow', async () => {
      // 1. Criar produto
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Full Flow Product',
          description: 'Testing complete CRUD flow',
          price: 1000,
          stock: 50,
        })
        .expect(201);

      const productId = createResponse.body.id;
      expect(productId).toBeDefined();

      // 2. Buscar produto criado
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Full Flow Product');
        });

      // 3. Verificar que aparece em listagens
      await request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          const product = res.body.data.find((p: any) => p.id === productId);
          expect(product).toBeDefined();
        });

      // 4. Atualizar produto
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ price: 900, stock: 45 })
        .expect(200)
        .expect((res) => {
          expect(res.body.price).toBe(900);
          expect(res.body.stock).toBe(45);
        });

      // 5. Deletar produto
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.isActive).toBe(false);
        });

      // 6. Verificar que não aparece mais em listagens
      await request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          const product = res.body.data.find((p: any) => p.id === productId);
          expect(product).toBeUndefined();
        });

      // 7. Verificar que retorna 404 ao buscar
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);
    });
  });
});
