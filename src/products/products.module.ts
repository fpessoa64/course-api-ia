import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

/**
 * Módulo de Produtos.
 *
 * Encapsula toda a funcionalidade relacionada a produtos:
 * - Controller: endpoints REST da API
 * - Service: lógica de negócio e armazenamento em memória
 *
 * Seguindo o padrão de módulos do NestJS:
 * - controllers: declara os controllers HTTP deste módulo
 * - providers: declara os services disponíveis para injeção de dependência
 * - exports: (opcional) exporta services para uso em outros módulos
 *
 * @module ProductsModule
 */
@Module({
  /**
   * Controllers registrados neste módulo.
   * O NestJS automaticamente configura as rotas HTTP definidas nos controllers.
   */
  controllers: [ProductsController],

  /**
   * Providers (services) deste módulo.
   * Disponíveis para injeção de dependência dentro do módulo.
   * ProductsController recebe ProductsService via constructor injection.
   */
  providers: [ProductsService],

  /**
   * Exports (opcional) - services disponíveis para outros módulos.
   * Exportamos ProductsService caso outros módulos futuros precisem acessá-lo.
   * Por exemplo: um módulo de Orders poderia injetar ProductsService para verificar estoque.
   */
  exports: [ProductsService],
})
export class ProductsModule {}
