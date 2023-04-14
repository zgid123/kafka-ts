import fp from 'fastify-plugin';
import { DEFAULT_CLIENT } from '@kafka-ts/core';
import { createProducers } from '@kafka-ts/producer-commons';

import type { FastifyPluginAsync } from 'fastify';
import type { IKafkaProducerProps } from '@kafka-ts/core/lib/interface';

import type { TPublishFunc, TGetProducerFunc } from './interface';

const kafkaProducer: FastifyPluginAsync<
  IKafkaProducerProps | IKafkaProducerProps[]
> = async (fastify, options) => {
  const clientProducers = await createProducers(options);

  const publish: TPublishFunc = async ({
    clientId = DEFAULT_CLIENT,
    topicMessages = [],
    ...rest
  }) => {
    const producer = clientProducers[clientId];

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
  };

  const getProducer: TGetProducerFunc = (clientId = DEFAULT_CLIENT) => {
    return clientProducers[clientId];
  };

  fastify.decorate('kafkaProducer', {
    publish,
    getProducer,
  });

  fastify.addHook('onClose', onClose);

  function onClose() {
    Object.values(clientProducers).forEach((producer) => {
      producer.disconnect();
    });
  }
};

export default fp(kafkaProducer, {
  fastify: '>=3',
  name: '@kafka-ts/fastify-producer',
});
