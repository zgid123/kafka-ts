Fastify's Plugin for Kafka Producer.

# Install

```sh
npm install --save @kafka-ts/fastify-producer

# or

yarn add @kafka-ts/fastify-producer

# or

pnpm add @kafka-ts/fastify-producer
```

# Usage

```ts
import detect from 'detect-port';
import KafkaProducer from '@kafka-ts/fastify-producer';

import { fastify } from 'config/fastify';

async function bootstrap(): Promise<typeof fastify> {
  fastify.register(KafkaProducer, {
    brokers: ['localhost:9092'],
  });

  fastify.get('/', async (_request, reply) => {
    const result = await fastify.kafkaProducer.publish({
      topicMessages: {
        topic: 'topic',
        messages: [
          {
            value: 'hello from producer',
          },
        ],
      },
    });

    console.log(result);

    reply.send('Ok');
  });

  fastify.get('/message', async (_request, reply) => {
    const result = await fastify.kafkaProducer.publish({
      topicMessages: {
        topic: 'topic_2',
        messages: [
          {
            value: 'hello from producer',
          },
        ],
      },
    });

    console.log(result);

    reply.send('Ok');
  });

  const port = await detect(3_000);
  await fastify.listen({
    port,
  });

  return fastify;
}

bootstrap();
```
