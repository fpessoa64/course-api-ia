import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para parâmetros de paginação em query strings.
 *
 * Este DTO é reutilizável em qualquer endpoint que necessite paginação.
 * Os decorators do class-validator garantem que os valores sejam válidos.
 * O decorator @Type converte strings da query para números.
 *
 * @class PaginationQueryDto
 * @example
 * // URL: GET /products?page=2&limit=20
 * // Resultado: { page: 2, limit: 20 }
 */
export class PaginationQueryDto {
  /**
   * Número da página a ser retornada.
   *
   * Validações:
   * - Opcional (usa valor padrão se não fornecido)
   * - Deve ser um número inteiro
   * - Deve ser >= 1 (páginas começam em 1, não em 0)
   *
   * @default 1
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  /**
   * Quantidade de itens por página.
   *
   * Validações:
   * - Opcional (usa valor padrão se não fornecido)
   * - Deve ser um número inteiro
   * - Deve ser >= 1
   * - Deve ser <= 100 (limite máximo para prevenir sobrecarga)
   *
   * @default 10
   * @example 10
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must be at most 100' })
  limit?: number = 10;
}
