import { IsString, IsNotEmpty, IsOptional, IsNumber, IsPositive, IsInt, Min } from 'class-validator';

/**
 * DTO para criação de um novo produto.
 *
 * Define e valida os dados necessários para criar um produto.
 * Os decorators do class-validator garantem que apenas dados válidos
 * sejam aceitos pela API.
 *
 * Campos gerados automaticamente (id, isActive, createdAt, updatedAt)
 * NÃO devem estar neste DTO.
 *
 * @class CreateProductDto
 * @example
 * {
 *   "name": "Laptop Dell Inspiron 15",
 *   "description": "Laptop profissional com 16GB RAM",
 *   "price": 4500.00,
 *   "stock": 10
 * }
 */
export class CreateProductDto {
  /**
   * Nome do produto.
   *
   * Validações:
   * - Obrigatório (não pode ser vazio)
   * - Deve ser uma string
   * - Deve conter pelo menos 1 caractere não-vazio
   *
   * @example "Laptop Dell Inspiron 15"
   */
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required and cannot be empty' })
  name: string;

  /**
   * Descrição detalhada do produto.
   *
   * Validações:
   * - Opcional (pode ser omitido)
   * - Se fornecido, deve ser uma string
   *
   * @example "Laptop profissional com processador Intel i7, 16GB RAM, SSD 512GB"
   */
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  /**
   * Preço do produto em reais (R$).
   *
   * Validações:
   * - Obrigatório
   * - Deve ser um número
   * - Deve ser positivo (> 0)
   *
   * @example 4500.00
   */
  @IsNumber({}, { message: 'Price must be a number' })
  @IsPositive({ message: 'Price must be a positive number' })
  price: number;

  /**
   * Quantidade em estoque.
   *
   * Validações:
   * - Obrigatório
   * - Deve ser um número inteiro
   * - Deve ser >= 0 (estoque pode ser zero)
   *
   * @example 10
   */
  @IsInt({ message: 'Stock must be an integer number' })
  @Min(0, { message: 'Stock must be at least 0' })
  stock: number;
}
