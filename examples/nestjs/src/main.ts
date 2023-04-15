import detect from 'detect-port';
import { NestFactory } from '@nestjs/core';
import { KafkaConsumer } from '@kafka-ts/nestjs-consumer';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice(
    KafkaConsumer.createService([
      {
        brokers: ['localhost:9092'],
        consumerOptions: {
          groupId: 'test-id',
        },
      },
      {
        clientId: 'test-client',
        brokers: ['localhost:9092'],
        consumerOptions: {
          groupId: 'test-id-2',
        },
      },
    ]),
  );

  const port = await detect(3_000);
  await app.startAllMicroservices();
  await app.listen(port);

  console.log(`Run on ${port}`);
}

bootstrap();
