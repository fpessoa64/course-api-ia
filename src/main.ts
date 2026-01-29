import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Função de bootstrap da aplicação.
 *
 * Responsável por:
 * 1. Criar instância da aplicação NestJS
 * 2. Configurar pipes globais (validação)
 * 3. Iniciar servidor HTTP na porta configurada
 *
 * @async
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Configura ValidationPipe global.
   *
   * O ValidationPipe valida automaticamente todos os DTOs usando class-validator.
   * Aplicado a todos os endpoints da aplicação.
   *
   * Configurações:
   * - whitelist: Remove propriedades não definidas nos DTOs
   *   Exemplo: Se DTO tem apenas 'name' e 'price', mas cliente envia 'name', 'price' e 'extra',
   *   o campo 'extra' é automaticamente removido.
   *
   * - forbidNonWhitelisted: Retorna erro 400 se propriedades extras forem enviadas
   *   Exemplo: Cliente envia campo não definido no DTO → 400 Bad Request
   *   Melhora segurança prevenindo mass assignment.
   *
   * - transform: Transforma payloads em instâncias de DTOs
   *   Converte tipos primitivos (strings de query para números, etc.)
   *   Exemplo: ?page=2&limit=10 → PaginationQueryDto { page: 2, limit: 10 }
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Inicia servidor HTTP.
   * Porta configurável via variável de ambiente PORT (default: 3000).
   */
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
