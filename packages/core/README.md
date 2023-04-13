A wrapper of [kafkajs](https://github.com/tulios/kafkajs) for Node.JS.

# Install

```sh
npm install --save @kafka-ts/core

# or

yarn add @kafka-ts/core

# or

pnpm add @kafka-ts/core
```

# Usage

```ts
import { parseMessage, Partitioners, createKafkaClients } from '@kafka-ts/core';

(async function test() {
  const kafkaClients = await createKafkaClients({
    brokers: ['localhost:9092'],
  });

  const consumer = kafkaClients.client.consumer({
    groupId: 'test-id',
  });

  const producer = kafkaClients.client.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });

  await Promise.all([consumer.connect(), producer.connect()]);

  await consumer.subscribe({
    topics: ['topic'],
    fromBeginning: true,
  });

  await consumer.run({
    eachBatch: async ({ batch }) => {
      const { messages } = batch;

      const rawMessages = messages.map((message) => {
        return parseMessage(message);
      });

      console.log(rawMessages);
    },
  });

  await producer.sendBatch({
    topicMessages: [
      {
        topic: 'topic',
        messages: [
          {
            value: 'hello from producer',
          },
        ],
      },
    ],
  });

  Promise.all(consumer.disconnect(), producer.disconnect());
})();
```
