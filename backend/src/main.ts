import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // Trust proxy: Required for secure cookies to work behind reverse proxy (nginx, load balancer)
  // Without this, req.protocol will be 'http' even behind HTTPS proxy, causing secure cookies to fail
  const httpAdapter = app.getHttpAdapter();
  if (httpAdapter.getType() === 'express') {
    httpAdapter.getInstance().set('trust proxy', 1);
  }

  // Cookie parser: Required to read httpOnly cookies in requests
  app.use(cookieParser());

  // CORS configuration - supports comma-separated origins (e.g. https://shop.com,https://www.shop.com)
  const frontendUrlRaw = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );
  const corsOrigins = frontendUrlRaw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-csrf-token'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  // Note: enableImplicitConversion removed - use explicit @Type() or @Transform() in DTOs
  // to avoid type coercion bypassing validation (NestJS security best practice)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  // Global exception filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // OpenAPI / Swagger docs (only when enabled)
  if (configService.get<string>('ENABLE_SWAGGER') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('ShopHub API')
      .setDescription('REST API for ShopHub e-commerce platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('cart_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
}
void bootstrap();
