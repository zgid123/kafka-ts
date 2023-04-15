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
