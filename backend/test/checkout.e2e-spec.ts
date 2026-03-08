import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import { ShippingOption } from '../src/checkout/dto';

describe('Checkout (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const validPlaceOrderBody = {
    shippingOption: ShippingOption.BEIRUT,
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+9611234567',
      email: 'john@example.com',
      country: 'Lebanon',
      city: 'Beirut',
      street1: '123 Main St',
    },
  };

  it('POST /api/checkout/place-order returns 400 when cart is empty', () => {
    return request(app.getHttpServer())
      .post('/api/checkout/place-order')
      .send(validPlaceOrderBody)
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('Cart is empty');
      });
  });

  it('POST /api/checkout/place-order returns 400 when shipping address is invalid', () => {
    return request(app.getHttpServer())
      .post('/api/checkout/place-order')
      .send({
        shippingOption: ShippingOption.BEIRUT,
        shippingAddress: {
          firstName: '',
          lastName: 'Doe',
          phone: '+9611234567',
          country: 'Lebanon',
          city: 'Beirut',
          street1: '123 Main St',
        },
      })
      .expect(400);
  });
});
