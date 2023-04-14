import {
  Partitioners,
  DEFAULT_CLIENT,
  createKafkaClients,
} from '@kafka-ts/core';

import type {
  IKafkaProducerProps,
  IClientProducerProps,
  TProducerConvertedOptions,
} from '@kafka-ts/core/lib/interface';

export async function createProducers(
  options: IKafkaProducerProps | IKafkaProducerProps[],
): Promise<IClientProducerProps> {
  if (!Array.isArray(options)) {
    options = [options];
  }

  const [clientOptions, producerOptions] =
    options.reduce<TProducerConvertedOptions>(
      (result, option) => {
        const { producerOptions, ...rest } = option;

        result[0].push(rest);
        result[1][rest.clientId || DEFAULT_CLIENT] = producerOptions || {};

        return result;
      },
      [[], {}],
    );

  const kafkaClients = await createKafkaClients(clientOptions);
  const kafkaProducers = await Promise.allSettled(
    Object.entries(kafkaClients.getAllClients()).map(
      async ([clientId = DEFAULT_CLIENT, client]) => {
        const { createPartitioner, ...rest } = producerOptions[clientId];

        const producer = client.producer({
          ...rest,
          createPartitioner:
            createPartitioner || Partitioners.LegacyPartitioner,
        });

        await producer.connect();

        return {
          clientId,
          producer,
        };
      },
    ),
  );

  return kafkaProducers.reduce<IClientProducerProps>(
    (result, settledKafkaProducer) => {
      if (settledKafkaProducer.status === 'fulfilled') {
        const { clientId, producer } = settledKafkaProducer.value;

        result[clientId] = producer;
      }

      return result;
    },
    {},
  );
}
