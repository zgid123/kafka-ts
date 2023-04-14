import { DEFAULT_CLIENT, createKafkaClients } from '@kafka-ts/core';

import type {
  IKafkaConsumerProps,
  IClientConsumerProps,
  TConsumerConvertedOptions,
} from '@kafka-ts/core/lib/interface';

export async function createConsumers(
  options: IKafkaConsumerProps | IKafkaConsumerProps[],
): Promise<IClientConsumerProps> {
  if (!Array.isArray(options)) {
    options = [options];
  }

  const [clientOptions, consumerOptions] =
    options.reduce<TConsumerConvertedOptions>(
      (result, option) => {
        const { consumerOptions, ...rest } = option;

        result[0].push(rest);
        result[1][rest.clientId || DEFAULT_CLIENT] = consumerOptions;

        return result;
      },
      [[], {}],
    );

  const kafkaClients = await createKafkaClients(clientOptions);
  const kafkaConsumers = await Promise.allSettled(
    Object.entries(kafkaClients.getAllClients()).map(
      async ([clientId, client]) => {
        const consumer = client.consumer(consumerOptions[clientId]);

        await consumer.connect();

        return {
          clientId,
          consumer,
        };
      },
    ),
  );

  return kafkaConsumers.reduce<IClientConsumerProps>(
    (result, settledKafkaConsumer) => {
      if (settledKafkaConsumer.status === 'fulfilled') {
        const { clientId, consumer } = settledKafkaConsumer.value;

        result[clientId] = consumer;
      }

      return result;
    },
    {},
  );
}
