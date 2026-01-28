/**
 * Interface que representa um Produto no sistema.
 *
 * Esta interface define a estrutura de dados de um produto armazenado em memória.
 * Como estamos usando armazenamento em memória (array), não precisamos de decorators
 * do TypeORM - apenas uma interface TypeScript pura.
 *
 * @interface Product
 */
export interface Product {
  /**
   * Identificador único do produto (UUID v4).
   * Gerado automaticamente no momento da criação.
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string;

  /**
   * Nome do produto.
   * Campo obrigatório, usado para identificação do produto.
   * @example "Laptop Dell Inspiron 15"
   */
  name: string;

  /**
   * Descrição detalhada do produto.
   * Campo opcional que fornece informações adicionais sobre o produto.
   * @example "Laptop profissional com processador Intel i7, 16GB RAM, SSD 512GB"
   */
  description: string;

  /**
   * Preço do produto em reais (R$).
   * Deve ser um valor positivo (> 0).
   * Armazenado como número decimal.
   * @example 4500.00
   */
  price: number;

  /**
   * Quantidade em estoque.
   * Deve ser um número inteiro não-negativo (>= 0).
   * @example 10
   */
  stock: number;

  /**
   * Flag de soft delete - indica se o produto está ativo.
   * - true: produto ativo e visível
   * - false: produto "deletado" (soft delete)
   *
   * Usamos soft delete para manter histórico e integridade referencial.
   * Produtos inativos não aparecem nas listagens mas permanecem no sistema.
   * @default true
   */
  isActive: boolean;

  /**
   * Data e hora de criação do produto.
   * Gerado automaticamente no momento da criação.
   * @example "2024-01-28T10:00:00.000Z"
   */
  createdAt: Date;

  /**
   * Data e hora da última atualização do produto.
   * Atualizado automaticamente sempre que o produto é modificado.
   * @example "2024-01-28T15:30:00.000Z"
   */
  updatedAt: Date;
}
