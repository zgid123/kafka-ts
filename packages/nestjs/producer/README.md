NestJS's Dynamic Module for Producer.

# Install

```sh
npm install --save @kafka-ts/nestjs-producer

# or

yarn add @kafka-ts/nestjs-producer

# or

pnpm add @kafka-ts/nestjs-producer
```

# Usage

```ts
// producer.module.ts
import { Module } from '@nestjs/common';
import { KafkaProducer } from '@kafka-ts/nestjs-producer';

import { ProducerController } from './producer.controller';

@Module({
  imports: [
    KafkaProducer.register([
      {
        brokers: ['localhost:9092'],
      },
    ]),
  ],
  controllers: [ProducerController],
})
export class ProducerModule {}
```

```ts
// producer.controller.ts
import { Controller, Get } from '@nestjs/common';
import { KafkaModel } from '@kafka-ts/nestjs-producer';

@Controller('/producer')
export class ProducerController {
  constructor(private readonly kafkaModel: KafkaModel) {}

  @Get()
  public async publish(): Promise<string> {
    this.kafkaModel
      .publish({
        topicMessages: [
          {
            topic: 'topic',
            messages: [
              {
                value: 'hello',
              },
            ],
          },
        ],
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });

    return 'Ok!';
  }

  @Get('message')
  public async publishMessage(): Promise<string> {
    this.kafkaModel
      .publish({
        topicMessages: {
          topic: 'topic_2',
          messages: [
            {
              value: 'hi',
            },
          ],
        },
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });

    return 'Ok!';
  }
}
```
