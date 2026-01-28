import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

/**
 * DTO para atualização de um produto existente.
 *
 * Herda todos os campos de CreateProductDto, mas torna TODOS opcionais
 * usando PartialType do @nestjs/mapped-types.
 *
 * Isso permite atualizações parciais (PATCH):
 * - Cliente pode enviar apenas os campos que deseja atualizar
 * - Todos os decorators de validação são preservados
 * - Campos não enviados permanecem inalterados
 *
 * @class UpdateProductDto
 * @extends {PartialType(CreateProductDto)}
 *
 * @example
 * // Atualizar apenas o preço
 * {
 *   "price": 4200.00
 * }
 *
 * @example
 * // Atualizar preço e estoque
 * {
 *   "price": 4200.00,
 *   "stock": 8
 * }
 *
 * @example
 * // Atualizar todos os campos
 * {
 *   "name": "Laptop Dell Inspiron 15 (Novo)",
 *   "description": "Versão atualizada",
 *   "price": 4000.00,
 *   "stock": 15
 * }
 */
export class UpdateProductDto extends PartialType(CreateProductDto) {
  // PartialType automaticamente:
  // 1. Copia todos os campos de CreateProductDto
  // 2. Torna todos os campos opcionais
  // 3. Preserva todos os decorators de validação
  //
  // Resultado:
  // - name?: string (validado se fornecido)
  // - description?: string (validado se fornecido)
  // - price?: number (validado se fornecido)
  // - stock?: number (validado se fornecido)
}
