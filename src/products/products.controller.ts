import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { Product } from './entities/product.entity';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
//
/**
 * Controller responsável pelos endpoints REST da API de produtos.
 *
 * Define 5 endpoints seguindo padrões RESTful:
 * - POST /products - Criar produto
 * - GET /products - Listar produtos (com paginação)
 * - GET /products/:id - Buscar produto por ID
 * - PATCH /products/:id - Atualizar produto (parcial)
 * - DELETE /products/:id - Deletar produto (soft delete)
 *
 * Todos os endpoints usam DTOs para validação automática via ValidationPipe.
 *
 * @class ProductsController
 */
@Controller('products')
export class ProductsController {
  /**
   * Injeta o ProductsService via Dependency Injection.
   * O NestJS resolve automaticamente a dependência.
   *
   * @param {ProductsService} productsService - Service com lógica de negócio
   */
  constructor(private readonly productsService: ProductsService) {}

  /**
   * POST /products
   *
   * Cria um novo produto.
   *
   * O ValidationPipe valida automaticamente o body usando CreateProductDto.
   * Campos inválidos ou ausentes resultam em erro 400 Bad Request.
   *
   * @param {CreateProductDto} createProductDto - Dados do produto (validados)
   * @returns {Product} Produto criado (201 Created)
   *
   * @example
   * // Request
   * POST /products
   * {
   *   "name": "Laptop Dell",
   *   "description": "Professional laptop",
   *   "price": 4500.00,
   *   "stock": 10
   * }
   *
   * // Response (201 Created)
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "name": "Laptop Dell",
   *   "description": "Professional laptop",
   *   "price": 4500.00,
   *   "stock": 10,
   *   "isActive": true,
   *   "createdAt": "2024-01-28T10:00:00.000Z",
   *   "updatedAt": "2024-01-28T10:00:00.000Z"
   * }
   */
  @Post()
  create(@Body() createProductDto: CreateProductDto): Product {
    return this.productsService.create(createProductDto);
  }

  /**
   * GET /products?page=1&limit=10
   *
   * Lista produtos com paginação.
   *
   * Query params são opcionais e validados por PaginationQueryDto:
   * - page: número da página (default: 1, min: 1)
   * - limit: itens por página (default: 10, min: 1, max: 100)
   *
   * Retorna apenas produtos ativos (isActive = true).
   *
   * @param {PaginationQueryDto} paginationQuery - Parâmetros de paginação (validados)
   * @returns {PaginatedResponseDto<Product>} Resposta paginada (200 OK)
   *
   * @example
   * // Request
   * GET /products?page=2&limit=5
   *
   * // Response (200 OK)
   * {
   *   "data": [
   *     { "id": "...", "name": "Product 6", ... },
   *     { "id": "...", "name": "Product 7", ... },
   *     ...
   *   ],
   *   "meta": {
   *     "total": 45,
   *     "page": 2,
   *     "limit": 5,
   *     "totalPages": 9
   *   }
   * }
   */
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): PaginatedResponseDto<Product> {
    return this.productsService.findAll(paginationQuery);
  }

  /**
   * GET /products/:id
   *
   * Busca um produto específico por ID.
   *
   * Retorna apenas se produto existir e estiver ativo.
   * Produtos inativos ou inexistentes retornam 404 Not Found.
   *
   * @param {string} id - ID do produto (UUID)
   * @returns {Product} Produto encontrado (200 OK)
   * @throws {NotFoundException} 404 se produto não existe ou está inativo
   *
   * @example
   * // Request
   * GET /products/550e8400-e29b-41d4-a716-446655440000
   *
   * // Response (200 OK)
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "name": "Laptop Dell",
   *   "price": 4500.00,
   *   ...
   * }
   *
   * @example
   * // Request (produto inexistente)
   * GET /products/00000000-0000-0000-0000-000000000000
   *
   * // Response (404 Not Found)
   * {
   *   "statusCode": 404,
   *   "message": "Product with ID \"00000000-0000-0000-0000-000000000000\" not found"
   * }
   */
  @Get(':id')
  findOne(@Param('id') id: string): Product {
    return this.productsService.findOne(id);
  }

  /**
   * PATCH /products/:id
   *
   * Atualiza um produto existente (atualização parcial).
   *
   * Aceita apenas os campos que devem ser atualizados.
   * Campos não enviados permanecem inalterados.
   * O ValidationPipe valida os campos enviados usando UpdateProductDto.
   *
   * @param {string} id - ID do produto a ser atualizado
   * @param {UpdateProductDto} updateProductDto - Dados a serem atualizados (validados)
   * @returns {Product} Produto atualizado (200 OK)
   * @throws {NotFoundException} 404 se produto não existe ou está inativo
   *
   * @example
   * // Request (atualizar apenas preço)
   * PATCH /products/550e8400-e29b-41d4-a716-446655440000
   * {
   *   "price": 4200.00
   * }
   *
   * // Response (200 OK)
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "name": "Laptop Dell", // Não alterado
   *   "price": 4200.00,      // Atualizado
   *   "stock": 10,           // Não alterado
   *   "updatedAt": "2024-01-28T11:00:00.000Z" // Atualizado automaticamente
   * }
   *
   * @example
   * // Request (atualizar múltiplos campos)
   * PATCH /products/550e8400-e29b-41d4-a716-446655440000
   * {
   *   "price": 4200.00,
   *   "stock": 8,
   *   "description": "Updated description"
   * }
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Product {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * DELETE /products/:id
   *
   * Deleta um produto (soft delete).
   *
   * Não remove fisicamente, apenas marca como inativo (isActive = false).
   * Produto deletado:
   * - Não aparece mais em listagens (GET /products)
   * - Não pode mais ser encontrado (GET /products/:id retorna 404)
   * - Permanece no sistema para histórico
   *
   * @param {string} id - ID do produto a ser deletado
   * @returns {Product} Produto deletado com isActive=false (200 OK)
   * @throws {NotFoundException} 404 se produto não existe ou já está inativo
   *
   * @example
   * // Request
   * DELETE /products/550e8400-e29b-41d4-a716-446655440000
   *
   * // Response (200 OK)
   * {
   *   "id": "550e8400-e29b-41d4-a716-446655440000",
   *   "name": "Laptop Dell",
   *   "isActive": false,  // Marcado como inativo
   *   "updatedAt": "2024-01-28T12:00:00.000Z"
   * }
   *
   * @example
   * // Request subsequente (produto já deletado)
   * GET /products/550e8400-e29b-41d4-a716-446655440000
   *
   * // Response (404 Not Found)
   * {
   *   "statusCode": 404,
   *   "message": "Product with ID \"...\" not found"
   * }
   */
  @Delete(':id')
  remove(@Param('id') id: string): Product {
    return this.productsService.remove(id);
  }
}
