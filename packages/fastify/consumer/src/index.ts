import fp from 'fastify-plugin';
import { createConsumers } from '@kafka-ts/consumer-commons';
import {
  parseMessage,
  DEFAULT_CLIENT,
  KafkaMessageContext,
  KafkaBatchMessageContext,
  type ConsumerRunConfig,
} from '@kafka-ts/core';

import type { FastifyPluginAsync } from 'fastify';
import type { IKafkaConsumerProps } from '@kafka-ts/core/lib/interface';

import type { TSubscribeFunc, TGetConsumerFunc } from './interface';

const kafkaConsumer: FastifyPluginAsync<
  IKafkaConsumerProps | IKafkaConsumerProps[]
> = async (fastify, options) => {
  const clientConsumers = await createConsumers(options);

  const subscribe: TSubscribeFunc = async (subscribeOpts, impl, opts) => {
    const {
      topics,
      fromBeginning,
      type = 'batch_message',
      clientId = DEFAULT_CLIENT,
    } = subscribeOpts;
    const consumer = clientConsumers[clientId];

    if (!consumer) {
      throw `Unknown client ${clientId}`;
    }

    await consumer.subscribe({
      topics,
      fromBeginning,
    });

    let providedOpts: ConsumerRunConfig = {};

    if (type === 'batch_message') {
      providedOpts = {
        eachBatch: async ({ batch, ...rest }) => {
          const { messages } = batch;
          const context = new KafkaBatchMessageContext({
            ...rest,
            batch,
          });

          const formattedMessages = messages.map((message) => {
            return parseMessage(message);
          });

          return impl(formattedMessages, context);
        },
      };
    } else {
      providedOpts = {
        eachMessage: async ({ message, ...rest }) => {
          const context = new KafkaMessageContext({
            ...rest,
            message,
          });

          return impl(
            parseMessage(message),
            context as unknown as KafkaBatchMessageContext, // TODO: fix type
          );
        },
      };
    }

    consumer.run({
      ...opts,
      ...providedOpts,
    });
  };

  const getConsumer: TGetConsumerFunc = (clientId = DEFAULT_CLIENT) => {
    return clientConsumers[clientId];
  };

  fastify.decorate('kafkaConsumer', {
    subscribe,
    getConsumer,
  });

  fastify.addHook('onClose', onClose);

  function onClose() {
    Object.values(clientConsumers).forEach((consumer) => {
      consumer.disconnect();
    });
  }
};

export default fp(kafkaConsumer, {
  fastify: '>=3',
  name: '@kafka-ts/fastify-consumer',
});
