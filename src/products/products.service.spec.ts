import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * Suite de testes unitários para ProductsService.
 *
 * Testa todos os métodos do service isoladamente, sem dependências externas.
 * Como o service usa armazenamento em memória, não precisamos mockar um repositório.
 *
 * Cobertura:
 * - create(): criação de produtos
 * - findAll(): listagem com paginação
 * - findOne(): busca por ID
 * - update(): atualização parcial
 * - remove(): soft delete
 */
describe('ProductsService', () => {
  let service: ProductsService;

  /**
   * Setup executado antes de cada teste.
   * Cria uma nova instância do service para cada teste (isolamento).
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  /**
   * Teste básico: verifica se o service foi criado corretamente.
   */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Testes do método create()
   */
  describe('create', () => {
    /**
     * Deve criar um produto com sucesso e gerar campos automáticos.
     */
    it('should create a product successfully', () => {
      const createProductDto: CreateProductDto = {
        name: 'Laptop Dell',
        description: 'Professional laptop',
        price: 4500.0,
        stock: 10,
      };

      const result = service.create(createProductDto);

      // Verifica que o produto foi criado com todos os campos
      expect(result).toMatchObject({
        name: 'Laptop Dell',
        description: 'Professional laptop',
        price: 4500.0,
        stock: 10,
      });

      // Verifica campos gerados automaticamente
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.isActive).toBe(true);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    /**
     * Deve criar produto sem descrição (campo opcional).
     */
    it('should create a product without description', () => {
      const createProductDto: CreateProductDto = {
        name: 'Mouse',
        price: 50.0,
        stock: 100,
      };

      const result = service.create(createProductDto);

      expect(result.name).toBe('Mouse');
      expect(result.description).toBeUndefined();
      expect(result.price).toBe(50.0);
      expect(result.stock).toBe(100);
    });

    /**
     * Deve gerar IDs únicos para cada produto.
     */
    it('should generate unique IDs for each product', () => {
      const dto: CreateProductDto = {
        name: 'Product',
        price: 100,
        stock: 10,
      };

      const product1 = service.create(dto);
      const product2 = service.create(dto);

      expect(product1.id).not.toBe(product2.id);
    });
  });

  /**
   * Testes do método findAll()
   */
  describe('findAll', () => {
    /**
     * Deve retornar lista paginada vazia quando não há produtos.
     */
    it('should return empty paginated list when no products exist', () => {
      const result = service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    /**
     * Deve retornar lista paginada com produtos ativos.
     */
    it('should return paginated list of active products', () => {
      // Cria 3 produtos
      service.create({ name: 'Product 1', price: 100, stock: 10 });
      service.create({ name: 'Product 2', price: 200, stock: 20 });
      service.create({ name: 'Product 3', price: 300, stock: 30 });

      const result = service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(3);
      expect(result.meta.totalPages).toBe(1);
    });

    /**
     * Deve respeitar parâmetros de paginação.
     */
    it('should respect pagination parameters', () => {
      // Cria 15 produtos
      for (let i = 1; i <= 15; i++) {
        service.create({ name: `Product ${i}`, price: i * 100, stock: i });
      }

      // Página 1 com limite 5
      const page1 = service.findAll({ page: 1, limit: 5 });
      expect(page1.data).toHaveLength(5);
      expect(page1.meta.page).toBe(1);
      expect(page1.meta.limit).toBe(5);
      expect(page1.meta.total).toBe(15);
      expect(page1.meta.totalPages).toBe(3);

      // Página 2 com limite 5
      const page2 = service.findAll({ page: 2, limit: 5 });
      expect(page2.data).toHaveLength(5);
      expect(page2.meta.page).toBe(2);

      // Página 3 com limite 5 (última página)
      const page3 = service.findAll({ page: 3, limit: 5 });
      expect(page3.data).toHaveLength(5);
      expect(page3.meta.page).toBe(3);
    });

    /**
     * Deve usar valores padrão quando parâmetros não fornecidos.
     */
    it('should use default values when parameters not provided', () => {
      // Cria alguns produtos
      for (let i = 1; i <= 5; i++) {
        service.create({ name: `Product ${i}`, price: 100, stock: 10 });
      }

      const result = service.findAll({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    /**
     * Deve excluir produtos inativos (soft delete).
     */
    it('should exclude inactive products from listing', () => {
      const product1 = service.create({
        name: 'Product 1',
        price: 100,
        stock: 10,
      });
      service.create({ name: 'Product 2', price: 200, stock: 20 });

      // Remove primeiro produto (soft delete)
      service.remove(product1.id);

      const result = service.findAll({ page: 1, limit: 10 });

      // Deve retornar apenas o produto ativo
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Product 2');
      expect(result.meta.total).toBe(1);
    });

    /**
     * Deve calcular totalPages corretamente.
     */
    it('should calculate totalPages correctly', () => {
      // Cria 25 produtos
      for (let i = 1; i <= 25; i++) {
        service.create({ name: `Product ${i}`, price: 100, stock: 10 });
      }

      const result = service.findAll({ page: 1, limit: 10 });

      // 25 produtos / 10 por página = 3 páginas (Math.ceil(25/10))
      expect(result.meta.totalPages).toBe(3);
    });
  });

  /**
   * Testes do método findOne()
   */
  describe('findOne', () => {
    /**
     * Deve retornar produto quando encontrado.
     */
    it('should return product when found', () => {
      const created = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      const result = service.findOne(created.id);

      expect(result).toEqual(created);
      expect(result.id).toBe(created.id);
      expect(result.name).toBe('Laptop');
    });

    /**
     * Deve lançar NotFoundException quando produto não existe.
     */
    it('should throw NotFoundException when product does not exist', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      expect(() => service.findOne(nonExistentId)).toThrow(NotFoundException);
      expect(() => service.findOne(nonExistentId)).toThrow(
        `Product with ID "${nonExistentId}" not found`,
      );
    });

    /**
     * Deve lançar NotFoundException quando produto está inativo.
     */
    it('should throw NotFoundException when product is inactive', () => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      // Remove produto (soft delete)
      service.remove(product.id);

      // Tentar buscar produto inativo
      expect(() => service.findOne(product.id)).toThrow(NotFoundException);
    });
  });

  /**
   * Testes do método update()
   */
  describe('update', () => {
    /**
     * Deve atualizar produto existente.
     */
    it('should update existing product', () => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      const updateDto: UpdateProductDto = {
        price: 4200,
        stock: 8,
      };

      const result = service.update(product.id, updateDto);

      expect(result.id).toBe(product.id);
      expect(result.name).toBe('Laptop'); // Não alterado
      expect(result.price).toBe(4200); // Atualizado
      expect(result.stock).toBe(8); // Atualizado
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    /**
     * Deve atualizar apenas campos fornecidos (atualização parcial).
     */
    it('should update only provided fields', () => {
      const product = service.create({
        name: 'Laptop',
        description: 'Original description',
        price: 4500,
        stock: 10,
      });

      const updateDto: UpdateProductDto = {
        price: 4200,
      };

      const result = service.update(product.id, updateDto);

      expect(result.name).toBe('Laptop'); // Não alterado
      expect(result.description).toBe('Original description'); // Não alterado
      expect(result.price).toBe(4200); // Atualizado
      expect(result.stock).toBe(10); // Não alterado
    });

    /**
     * Deve lançar NotFoundException quando produto não existe.
     */
    it('should throw NotFoundException when product does not exist', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const updateDto: UpdateProductDto = { price: 100 };

      expect(() => service.update(nonExistentId, updateDto)).toThrow(
        NotFoundException,
      );
    });

    /**
     * Deve lançar NotFoundException quando produto está inativo.
     */
    it('should throw NotFoundException when product is inactive', () => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      service.remove(product.id);

      expect(() => service.update(product.id, { price: 4200 })).toThrow(
        NotFoundException,
      );
    });

    /**
     * Deve atualizar timestamp updatedAt.
     */
    it('should update updatedAt timestamp', (done) => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      const originalUpdatedAt = product.updatedAt;

      // Aguarda 10ms para garantir timestamp diferente
      setTimeout(() => {
        const updated = service.update(product.id, { price: 4200 });

        expect(updated.updatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
        done();
      }, 10);
    });
  });

  /**
   * Testes do método remove()
   */
  describe('remove', () => {
    /**
     * Deve fazer soft delete do produto (marcar como inativo).
     */
    it('should soft delete product (mark as inactive)', () => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      const result = service.remove(product.id);

      expect(result.id).toBe(product.id);
      expect(result.isActive).toBe(false);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    /**
     * Deve retornar produto deletado.
     */
    it('should return deleted product', () => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      const result = service.remove(product.id);

      expect(result).toMatchObject({
        id: product.id,
        name: 'Laptop',
        price: 4500,
        stock: 10,
        isActive: false,
      });
    });

    /**
     * Deve lançar NotFoundException quando produto não existe.
     */
    it('should throw NotFoundException when product does not exist', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      expect(() => service.remove(nonExistentId)).toThrow(NotFoundException);
    });

    /**
     * Deve lançar NotFoundException quando produto já está inativo.
     */
    it('should throw NotFoundException when product is already inactive', () => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      // Primeira remoção (sucesso)
      service.remove(product.id);

      // Segunda remoção (deve falhar)
      expect(() => service.remove(product.id)).toThrow(NotFoundException);
    });

    /**
     * Produto deletado não deve aparecer em findAll().
     */
    it('should not list deleted product in findAll()', () => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      service.remove(product.id);

      const result = service.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    /**
     * Produto deletado não deve ser encontrado por findOne().
     */
    it('should not find deleted product with findOne()', () => {
      const product = service.create({
        name: 'Laptop',
        price: 4500,
        stock: 10,
      });

      service.remove(product.id);

      expect(() => service.findOne(product.id)).toThrow(NotFoundException);
    });
  });
});
