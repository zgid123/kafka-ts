import { Inject, Injectable } from '@nestjs/common';
import { DEFAULT_CLIENT, type RecordMetadata } from '@kafka-ts/core';

import type {
  IPublishParams,
  IClientProducerProps,
} from '@kafka-ts/core/lib/interface';

import { KAFKA_PRODUCERS } from './constants';

@Injectable()
export class KafkaModel {
  #clientProducers: IClientProducerProps;

  constructor(@Inject(KAFKA_PRODUCERS) clientProducers: IClientProducerProps) {
    this.#clientProducers = clientProducers;
  }

  public publish({
    clientId = DEFAULT_CLIENT,
    topicMessages = [],
    ...rest
  }: IPublishParams): Promise<RecordMetadata[]> {
    const producer = this.#clientProducers[clientId];

    if (!producer) {
      throw `Unknown client ${clientId}`;
    }

    if (Array.isArray(topicMessages)) {
      return producer.sendBatch({
        ...rest,
        topicMessages,
      });
    }

    return producer.send({
      ...rest,
      ...topicMessages,
    });
  }
}
