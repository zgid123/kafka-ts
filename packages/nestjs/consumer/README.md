NestJS's Dynamic Module for Consumer.

# Install

```sh
npm install --save @kafka-ts/nestjs-consumer

# or

yarn add @kafka-ts/nestjs-consumer

# or

pnpm add @kafka-ts/nestjs-consumer
```

# Usage

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { KafkaConsumer } from '@kafka-ts/nestjs-consumer';

import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new KafkaConsumer({
        brokers: ['localhost:9092'],
        consumerOptions: {
          groupId: 'test-id',
        },
      }),
    },
  );

  await app.listen(3_000);
}

bootstrap();
```

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { KafkaConsumer } from '@kafka-ts/nestjs-consumer';

import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    KafkaConsumer.createService({
      brokers: ['localhost:9092'],
      consumerOptions: {
        groupId: 'test-id',
      },
    }),
  );

  await app.listen(3_000);
}

bootstrap();
```

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { KafkaConsumer } from '@kafka-ts/nestjs-consumer';

import { AppModule } from 'app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice(
    KafkaConsumer.createService({
      brokers: ['localhost:9092'],
      consumerOptions: {
        groupId: 'test-id',
      },
    }),
  );

  await app.startAllMicroservices();
  await app.listen(3_000);
}

bootstrap();
```

```ts
// consumer.controller.ts
import { Controller } from '@nestjs/common';
import {
  Ctx,
  Payload,
  Subscribe,
  SubscribeMessage,
  KafkaMessageContext,
  KafkaBatchMessageContext,
} from '@kafka-ts/nestjs-consumer';

@Controller()
export class ConsumerController {
  @Subscribe({
    topics: ['topic'],
  })
  public async handleSubscribe(
    @Payload() data: string[],
    @Ctx() context: KafkaBatchMessageContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context.batch', context.batch);

    return 'Ok!';
  }
}
```

### In case you wanna support multiple `clientId`

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { KafkaConsumer } from '@kafka-ts/nestjs-consumer';

import { AppModule } from 'app.module';

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

  await app.startAllMicroservices();
  await app.listen(3_000);
}

bootstrap();
```

```ts
// consumer.controller.ts
import { Controller } from '@nestjs/common';
import {
  Ctx,
  Payload,
  Subscribe,
  SubscribeMessage,
  KafkaMessageContext,
  KafkaBatchMessageContext,
} from '@kafka-ts/nestjs-consumer';

@Controller()
export class ConsumerController {
  @Subscribe({
    topics: ['topic'],
  })
  public async handleSubscribe(
    @Payload() data: string[],
    @Ctx() context: KafkaBatchMessageContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context.batch', context.batch);

    return 'Ok!';
  }

  @Subscribe({
    clientId: 'test-client',
    topics: ['topic_2'],
  })
  public async handleSubscribeTestClient(
    @Payload() data: string[],
    @Ctx() context: KafkaBatchMessageContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context.batch', context.batch);

    return 'Ok!';
  }
}
```

### Wanna subscribe eachBatch and eachMessage?

If you wanna subscribe `eachBatch` and `eachMessage`, you should define two topic in different `clientId` or else only `eachBatch` or `eachMessage` can run.

```ts
// main.ts
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
```

```ts
// consumer.controller.ts
import { Controller } from '@nestjs/common';
import {
  Ctx,
  Payload,
  Subscribe,
  SubscribeMessage,
  KafkaMessageContext,
  KafkaBatchMessageContext,
} from '@kafka-ts/nestjs-consumer';

@Controller()
export class ConsumerController {
  @Subscribe({
    topics: ['topic'],
  })
  public async handleSubscribe(
    @Payload() data: string[],
    @Ctx() context: KafkaBatchMessageContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context.batch', context.batch);

    return 'Ok!';
  }

  @SubscribeMessage({
    clientId: 'test-client',
    topics: ['topic_2'],
  })
  public async handleSubscribeMessage(
    @Payload() data: string,
    @Ctx() context: KafkaMessageContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context.message', context.message);

    return 'Ok!';
  }
}
```
