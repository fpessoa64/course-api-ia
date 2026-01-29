import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

/**
 * Service responsável pela lógica de negócio de produtos.
 *
 * Implementa armazenamento em memória usando array privado.
 * Todos os dados são perdidos ao reiniciar a aplicação.
 *
 * Funcionalidades:
 * - CRUD completo de produtos
 * - Paginação de listagens
 * - Soft delete (isActive flag)
 * - Geração automática de IDs (UUID)
 * - Controle de timestamps
 *
 * @class ProductsService
 */
@Injectable()
export class ProductsService {
  /**
   * Array privado para armazenamento em memória dos produtos.
   * Dados são perdidos ao reiniciar a aplicação.
   */
  private products: Product[] = [];

  /**
   * Cria um novo produto.
   *
   * Gera automaticamente:
   * - id: UUID v4
   * - isActive: true (produto ativo por padrão)
   * - createdAt: timestamp atual
   * - updatedAt: timestamp atual
   *
   * @param {CreateProductDto} createProductDto - Dados do produto a ser criado
   * @returns {Product} Produto criado com todos os campos preenchidos
   *
   * @example
   * const product = this.productsService.create({
   *   name: 'Laptop Dell',
   *   description: 'Professional laptop',
   *   price: 4500.00,
   *   stock: 10
   * });
   */
  create(createProductDto: CreateProductDto): Product {
    const now = new Date();

    // Cria novo produto com campos gerados automaticamente
    const product: Product = {
      id: randomUUID(), // Gera UUID v4
      ...createProductDto,
      isActive: true, // Produto ativo por padrão
      createdAt: now,
      updatedAt: now,
    };

    // Adiciona produto ao array em memória
    this.products.push(product);

    return product;
  }

  /**
   * Lista produtos com paginação.
   *
   * Retorna apenas produtos ativos (isActive = true).
   * Implementa paginação usando Array.slice().
   *
   * Algoritmo de paginação:
   * 1. Filtra apenas produtos ativos
   * 2. Calcula offset: (page - 1) * limit
   * 3. Extrai slice do array: [offset, offset + limit]
   * 4. Calcula metadados (total, totalPages)
   *
   * @param {PaginationQueryDto} paginationQuery - Parâmetros de paginação (page, limit)
   * @returns {PaginatedResponseDto<Product>} Resposta paginada com dados e metadados
   *
   * @example
   * // Listar página 2 com 10 itens por página
   * const result = this.productsService.findAll({ page: 2, limit: 10 });
   * // result = {
   * //   data: [produto11, produto12, ...],
   * //   meta: { total: 45, page: 2, limit: 10, totalPages: 5 }
   * // }
   */
  findAll(paginationQuery: PaginationQueryDto): PaginatedResponseDto<Product> {
    const { page = 1, limit = 10 } = paginationQuery;

    // Filtra apenas produtos ativos (soft delete)
    const activeProducts = this.products.filter(
      (product) => product.isActive === true,
    );

    // Calcula offset para paginação: primeira página (1) começa no índice 0
    const offset = (page - 1) * limit;

    // Extrai slice do array para a página solicitada
    const paginatedProducts = activeProducts.slice(offset, offset + limit);

    // Calcula total de páginas: arredonda para cima
    const totalPages = Math.ceil(activeProducts.length / limit);

    // Retorna resposta paginada com dados e metadados
    return {
      data: paginatedProducts,
      meta: {
        total: activeProducts.length, // Total de produtos ativos
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Busca um produto por ID.
   *
   * Retorna apenas se o produto existir e estiver ativo (isActive = true).
   * Produtos inativos são tratados como não encontrados.
   *
   * @param {string} id - ID do produto (UUID)
   * @returns {Product} Produto encontrado
   * @throws {NotFoundException} Se produto não existe ou está inativo
   *
   * @example
   * const product = this.productsService.findOne('550e8400-e29b-41d4-a716-446655440000');
   */
  findOne(id: string): Product {
    // Busca produto por ID que esteja ativo
    const product = this.products.find(
      (p) => p.id === id && p.isActive === true,
    );

    // Lança exceção se não encontrado ou inativo
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  /**
   * Atualiza um produto existente.
   *
   * Permite atualização parcial (apenas campos fornecidos são atualizados).
   * Atualiza automaticamente o campo updatedAt.
   *
   * @param {string} id - ID do produto a ser atualizado
   * @param {UpdateProductDto} updateProductDto - Dados a serem atualizados (parcial)
   * @returns {Product} Produto atualizado
   * @throws {NotFoundException} Se produto não existe ou está inativo
   *
   * @example
   * // Atualizar apenas preço
   * const updated = this.productsService.update('uuid', { price: 4200.00 });
   *
   * @example
   * // Atualizar múltiplos campos
   * const updated = this.productsService.update('uuid', {
   *   price: 4200.00,
   *   stock: 8
   * });
   */
  update(id: string, updateProductDto: UpdateProductDto): Product {
    // Busca índice do produto no array
    const index = this.products.findIndex(
      (p) => p.id === id && p.isActive === true,
    );

    // Lança exceção se não encontrado ou inativo
    if (index === -1) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Atualiza produto preservando campos não fornecidos
    // Spread operator (...) mescla campos existentes com novos valores
    this.products[index] = {
      ...this.products[index], // Campos existentes
      ...updateProductDto, // Novos valores (sobrescreve apenas os fornecidos)
      updatedAt: new Date(), // Atualiza timestamp
    };

    return this.products[index];
  }

  /**
   * Remove um produto (soft delete).
   *
   * Não remove fisicamente do array, apenas marca como inativo (isActive = false).
   * Isso preserva dados para histórico e integridade referencial.
   *
   * Produtos inativos:
   * - Não aparecem em listagens (findAll)
   * - Não podem ser encontrados (findOne)
   * - Não podem ser atualizados (update)
   * - Podem ser "deletados" novamente (idempotente)
   *
   * @param {string} id - ID do produto a ser removido
   * @returns {Product} Produto removido (com isActive = false)
   * @throws {NotFoundException} Se produto não existe ou já está inativo
   *
   * @example
   * const removed = this.productsService.remove('uuid');
   * // removed.isActive === false
   */
  remove(id: string): Product {
    // Busca índice do produto no array
    const index = this.products.findIndex(
      (p) => p.id === id && p.isActive === true,
    );

    // Lança exceção se não encontrado ou já inativo
    if (index === -1) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Marca como inativo (soft delete)
    this.products[index] = {
      ...this.products[index],
      isActive: false, // Soft delete
      updatedAt: new Date(), // Atualiza timestamp
    };

    return this.products[index];
  }
}
