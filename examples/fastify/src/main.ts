import detect from 'detect-port';
import KafkaProducer from '@kafka-ts/fastify-producer';
import KafkaConsumer from '@kafka-ts/fastify-consumer';

import { fastify } from 'config/fastify';

async function bootstrap(): Promise<typeof fastify> {
  fastify.register(KafkaProducer, {
    brokers: ['localhost:9092'],
  });

  fastify.register(KafkaConsumer, [
    {
      brokers: ['localhost:9092'],
      consumerOptions: {
        groupId: 'test-id',
      },
    },
    {
      clientId: 'test-client',
      brokers: ['localhost:9092'],
      consumerOptions: {
        groupId: 'test-id-2',
      },
    },
  ]);

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

  fastify.kafkaConsumer.subscribe(
    {
      topics: ['topic'],
    },
    async (data, context) => {
      console.log('data', data);
      console.log('context.batch', context.batch);
    },
  );

  fastify.kafkaConsumer.subscribe(
    {
      clientId: 'test-client',
      type: 'message',
      topics: ['topic_2'],
    },
    async (data, context) => {
      console.log('data', data);
      console.log('context.message', context.message);
    },
  );

  return fastify;
}

bootstrap();
