import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { NotFoundException } from '@nestjs/common';

/**
 * Suite de testes unitários para ProductsController.
 *
 * Testa todos os endpoints do controller isoladamente, mockando o ProductsService.
 * Verifica que:
 * - Controller chama os métodos corretos do service
 * - Parâmetros são passados corretamente
 * - Respostas do service são retornadas corretamente
 * - Exceções do service são propagadas
 *
 * Cobertura:
 * - POST /products
 * - GET /products (com paginação)
 * - GET /products/:id
 * - PATCH /products/:id
 * - DELETE /products/:id
 */
describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  /**
   * Mock do ProductsService.
   * Define jest.fn() para cada método que será chamado pelo controller.
   */
  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  /**
   * Setup executado antes de cada teste.
   * Cria módulo de teste com controller e mock do service.
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  /**
   * Limpa mocks após cada teste para garantir isolamento.
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Teste básico: verifica se o controller foi criado corretamente.
   */
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  /**
   * Testes do endpoint POST /products
   */
  describe('create', () => {
    /**
     * Deve criar um produto chamando service.create().
     */
    it('should create a product', () => {
      const createDto: CreateProductDto = {
        name: 'Laptop Dell',
        description: 'Professional laptop',
        price: 4500.0,
        stock: 10,
      };

      const expectedResult: Product = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock retorna produto criado
      mockProductsService.create.mockReturnValue(expectedResult);

      const result = controller.create(createDto);

      // Verifica que service.create foi chamado com DTO correto
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);

      // Verifica que retorno é o esperado
      expect(result).toEqual(expectedResult);
    });

    /**
     * Deve criar produto sem descrição (campo opcional).
     */
    it('should create a product without description', () => {
      const createDto: CreateProductDto = {
        name: 'Mouse',
        price: 50.0,
        stock: 100,
      };

      const expectedResult: Product = {
        id: 'uuid',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.create.mockReturnValue(expectedResult);

      const result = controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  /**
   * Testes do endpoint GET /products
   */
  describe('findAll', () => {
    /**
     * Deve retornar lista paginada de produtos.
     */
    it('should return paginated list of products', () => {
      const paginationQuery = { page: 1, limit: 10 };

      const expectedResult = {
        data: [
          {
            id: 'uuid1',
            name: 'Product 1',
            price: 100,
            stock: 10,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Product,
          {
            id: 'uuid2',
            name: 'Product 2',
            price: 200,
            stock: 20,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Product,
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockProductsService.findAll.mockReturnValue(expectedResult);

      const result = controller.findAll(paginationQuery);

      // Verifica que service.findAll foi chamado com query params
      expect(service.findAll).toHaveBeenCalledWith(paginationQuery);
      expect(service.findAll).toHaveBeenCalledTimes(1);

      // Verifica que retorno contém dados e metadados
      expect(result).toEqual(expectedResult);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    /**
     * Deve usar valores padrão quando query params não fornecidos.
     */
    it('should use default pagination values', () => {
      const paginationQuery = {};

      const expectedResult = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      mockProductsService.findAll.mockReturnValue(expectedResult);

      const result = controller.findAll(paginationQuery);

      expect(service.findAll).toHaveBeenCalledWith(paginationQuery);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    /**
     * Deve retornar lista vazia quando não há produtos.
     */
    it('should return empty list when no products exist', () => {
      const paginationQuery = { page: 1, limit: 10 };

      const expectedResult = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      mockProductsService.findAll.mockReturnValue(expectedResult);

      const result = controller.findAll(paginationQuery);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  /**
   * Testes do endpoint GET /products/:id
   */
  describe('findOne', () => {
    /**
     * Deve retornar produto quando encontrado.
     */
    it('should return a product by id', () => {
      const productId = '550e8400-e29b-41d4-a716-446655440000';

      const expectedResult: Product = {
        id: productId,
        name: 'Laptop Dell',
        description: 'Professional laptop',
        price: 4500.0,
        stock: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.findOne.mockReturnValue(expectedResult);

      const result = controller.findOne(productId);

      // Verifica que service.findOne foi chamado com ID correto
      expect(service.findOne).toHaveBeenCalledWith(productId);
      expect(service.findOne).toHaveBeenCalledTimes(1);

      // Verifica que retorno é o esperado
      expect(result).toEqual(expectedResult);
      expect(result.id).toBe(productId);
    });

    /**
     * Deve propagar NotFoundException do service.
     */
    it('should throw NotFoundException when product not found', () => {
      const productId = 'non-existent-id';

      mockProductsService.findOne.mockImplementation(() => {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      });

      expect(() => controller.findOne(productId)).toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(productId);
    });
  });

  /**
   * Testes do endpoint PATCH /products/:id
   */
  describe('update', () => {
    /**
     * Deve atualizar produto existente.
     */
    it('should update a product', () => {
      const productId = '550e8400-e29b-41d4-a716-446655440000';

      const updateDto: UpdateProductDto = {
        price: 4200.0,
        stock: 8,
      };

      const expectedResult: Product = {
        id: productId,
        name: 'Laptop Dell',
        description: 'Professional laptop',
        price: 4200.0,
        stock: 8,
        isActive: true,
        createdAt: new Date('2024-01-28T10:00:00.000Z'),
        updatedAt: new Date('2024-01-28T11:00:00.000Z'),
      };

      mockProductsService.update.mockReturnValue(expectedResult);

      const result = controller.update(productId, updateDto);

      // Verifica que service.update foi chamado com ID e DTO corretos
      expect(service.update).toHaveBeenCalledWith(productId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);

      // Verifica que retorno contém dados atualizados
      expect(result).toEqual(expectedResult);
      expect(result.price).toBe(4200.0);
      expect(result.stock).toBe(8);
    });

    /**
     * Deve atualizar apenas campos fornecidos (atualização parcial).
     */
    it('should update only provided fields', () => {
      const productId = 'uuid';

      const updateDto: UpdateProductDto = {
        price: 4200.0,
      };

      const expectedResult: Product = {
        id: productId,
        name: 'Laptop Dell',
        description: 'Original description',
        price: 4200.0,
        stock: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.update.mockReturnValue(expectedResult);

      const result = controller.update(productId, updateDto);

      expect(service.update).toHaveBeenCalledWith(productId, updateDto);
      expect(result.price).toBe(4200.0);
      expect(result.name).toBe('Laptop Dell'); // Não alterado
      expect(result.stock).toBe(10); // Não alterado
    });

    /**
     * Deve propagar NotFoundException do service.
     */
    it('should throw NotFoundException when product not found', () => {
      const productId = 'non-existent-id';
      const updateDto: UpdateProductDto = { price: 100 };

      mockProductsService.update.mockImplementation(() => {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      });

      expect(() => controller.update(productId, updateDto)).toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(productId, updateDto);
    });
  });

  /**
   * Testes do endpoint DELETE /products/:id
   */
  describe('remove', () => {
    /**
     * Deve deletar produto (soft delete).
     */
    it('should remove a product', () => {
      const productId = '550e8400-e29b-41d4-a716-446655440000';

      const expectedResult: Product = {
        id: productId,
        name: 'Laptop Dell',
        description: 'Professional laptop',
        price: 4500.0,
        stock: 10,
        isActive: false, // Soft delete
        createdAt: new Date('2024-01-28T10:00:00.000Z'),
        updatedAt: new Date('2024-01-28T12:00:00.000Z'),
      };

      mockProductsService.remove.mockReturnValue(expectedResult);

      const result = controller.remove(productId);

      // Verifica que service.remove foi chamado com ID correto
      expect(service.remove).toHaveBeenCalledWith(productId);
      expect(service.remove).toHaveBeenCalledTimes(1);

      // Verifica que retorno contém produto com isActive=false
      expect(result).toEqual(expectedResult);
      expect(result.isActive).toBe(false);
    });

    /**
     * Deve propagar NotFoundException do service.
     */
    it('should throw NotFoundException when product not found', () => {
      const productId = 'non-existent-id';

      mockProductsService.remove.mockImplementation(() => {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      });

      expect(() => controller.remove(productId)).toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(productId);
    });

    /**
     * Deve propagar NotFoundException quando produto já está inativo.
     */
    it('should throw NotFoundException when product already inactive', () => {
      const productId = 'uuid';

      mockProductsService.remove.mockImplementation(() => {
        throw new NotFoundException(`Product with ID "${productId}" not found`);
      });

      expect(() => controller.remove(productId)).toThrow(NotFoundException);
    });
  });
});
