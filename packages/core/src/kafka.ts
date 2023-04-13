import { Kafka } from 'kafkajs';

import { parseBrokers } from './utils';
import { DEFAULT_CLIENT } from './constants';

import type { IKafkaProps, TBrokers } from './interface';

interface IGroupedKafkaClientProps {
  [key: string]: Kafka;
}

interface IKafkaClientsProps {
  client: Kafka;
  getClient: (clientId?: string) => Kafka;
  getAllClients: () => IGroupedKafkaClientProps;
}

async function createKafka({ brokers, ...rest }: IKafkaProps): Promise<Kafka> {
  let list: TBrokers;

  if (typeof brokers === 'function') {
    list = await brokers();
  } else {
    list = brokers;
  }

  const kafka = new Kafka({
    brokers: parseBrokers(list),
    ...rest,
    clientId: rest.clientId,
  });

  return kafka;
}

export async function createKafkaClients(
  clientOptions: IKafkaProps | IKafkaProps[],
): Promise<IKafkaClientsProps> {
  if (!Array.isArray(clientOptions)) {
    clientOptions = [clientOptions];
  }

  const kafkas = await Promise.all(
    clientOptions.map(async (clientOption) => {
      const { clientId = DEFAULT_CLIENT } = clientOption;
      const kafka = await createKafka(clientOption);

      return {
        kafka,
        clientId,
      };
    }),
  );

  const kafkaClients = kafkas.reduce<IGroupedKafkaClientProps>(
    (result, kafkaClient) => {
      const { clientId, kafka } = kafkaClient;

      result[clientId] = kafka;

      return result;
    },
    {},
  );

  const getClient: IKafkaClientsProps['getClient'] = (
    clientId = DEFAULT_CLIENT,
  ) => {
    return kafkaClients[clientId];
  };

  const getAllClients: IKafkaClientsProps['getAllClients'] = () => {
    return kafkaClients;
  };

  return {
    getClient,
    getAllClients,
    client: getClient(DEFAULT_CLIENT) || kafkas[0].kafka,
  };
}
