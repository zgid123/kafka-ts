import type { KafkaMessage } from 'kafkajs';

import type { TBrokers } from './interface';

export function parseBrokers(brokers: TBrokers): string[] {
  return brokers.map((broker) => {
    if (typeof broker === 'string') {
      return broker;
    }

    return [broker.domain, (broker.port || '9092').toString()].join(':');
  });
}

export function parseMessage<T = unknown>(message: KafkaMessage): T {
  const { value } = message;
  let rawMessage = value?.toString() || '';

  try {
    rawMessage = JSON.parse(rawMessage);
  } catch {
    // do nothing
  }

  return rawMessage as T;
}
