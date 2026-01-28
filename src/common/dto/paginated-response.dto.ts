/**
 * DTO genérico para respostas paginadas.
 *
 * Esta classe fornece uma estrutura padronizada para todas as respostas
 * paginadas da API, incluindo os dados e metadados de paginação.
 *
 * O uso de generics (<T>) permite reutilizar esta classe para qualquer tipo de dado.
 *
 * @class PaginatedResponseDto
 * @template T - Tipo dos dados a serem paginados
 *
 * @example
 * // Uso com produtos
 * const response: PaginatedResponseDto<Product> = {
 *   data: [product1, product2, ...],
 *   meta: {
 *     total: 45,
 *     page: 1,
 *     limit: 10,
 *     totalPages: 5
 *   }
 * };
 */
export class PaginatedResponseDto<T> {
  /**
   * Array contendo os itens da página atual.
   * O tamanho deste array deve ser <= limit (exceto na última página).
   */
  data: T[];

  /**
   * Metadados sobre a paginação.
   * Fornece informações úteis para o cliente construir controles de navegação.
   */
  meta: {
    /**
     * Número total de itens disponíveis (em todas as páginas).
     * @example 45
     */
    total: number;

    /**
     * Número da página atual.
     * @example 1
     */
    page: number;

    /**
     * Quantidade de itens por página.
     * @example 10
     */
    limit: number;

    /**
     * Número total de páginas.
     * Calculado como: Math.ceil(total / limit)
     * @example 5
     */
    totalPages: number;
  };
}
