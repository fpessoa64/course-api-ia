import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';

/**
 * Módulo raiz da aplicação.
 *
 * Importa e integra todos os módulos de feature da aplicação.
 * O NestJS usa este módulo como ponto de entrada para bootstrap.
 *
 * @module AppModule
 */
@Module({
  /**
   * Módulos importados nesta aplicação.
   * - ProductsModule: funcionalidade de gerenciamento de produtos
   */
  imports: [ProductsModule],

  /**
   * Controllers do módulo raiz.
   * AppController fornece endpoint básico GET / para health check.
   */
  controllers: [AppController],

  /**
   * Providers (services) do módulo raiz.
   */
  providers: [AppService],
})
export class AppModule {}
