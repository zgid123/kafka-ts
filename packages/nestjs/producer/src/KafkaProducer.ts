import { createProducers } from '@kafka-ts/producer-commons';
import {
  Inject,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';

import type {
  IKafkaProducerProps,
  IClientProducerProps,
} from '@kafka-ts/core/lib/interface';

import { KafkaModel } from './KafkaModel';
import { KAFKA_PRODUCERS } from './constants';

@Module({})
export class KafkaProducer implements OnApplicationShutdown {
  public static async register(
    options: IKafkaProducerProps | IKafkaProducerProps[],
  ): Promise<DynamicModule> {
    const clientProducers = await createProducers(options);

    return {
      module: KafkaProducer,
      providers: [
        {
          provide: KAFKA_PRODUCERS,
          useFactory: async (): Promise<IClientProducerProps> => {
            return clientProducers;
          },
        },
        KafkaModel,
      ],
      exports: [KafkaModel],
    };
  }

  constructor(
    @Inject(KAFKA_PRODUCERS)
    private readonly clientProducers: IClientProducerProps,
  ) {}

  // for jest test or other usages
  public onApplicationShutdown(_signal: string) {
    Object.values(this.clientProducers).forEach((producer) => {
      producer.disconnect();
    });
  }
}
