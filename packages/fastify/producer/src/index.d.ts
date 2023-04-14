import type { TGetProducerFunc, TPublishFunc } from './interface';

declare module 'fastify' {
  export interface FastifyInstance {
    kafkaProducer: {
      publish: TPublishFunc;
      getProducer: TGetProducerFunc;
    };
  }
}
