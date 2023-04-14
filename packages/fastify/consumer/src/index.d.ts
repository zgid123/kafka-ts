import type {
  TSubscribeType,
  TSubscribeOptions,
} from '@kafka-ts/core/lib/interface';

import type {
  TImplFunc,
  TGetConsumerFunc,
  TTopicOptionsProps,
} from './interface';

declare module 'fastify' {
  export interface FastifyInstance {
    kafkaConsumer: {
      getConsumer: TGetConsumerFunc;
      subscribe: <
        TData = any,
        TType extends TSubscribeType = 'batch_message',
        TImpl extends TImplFunc<TData, TType> = TImplFunc<TData, TType>,
        TOptions extends TSubscribeOptions<TType> = TSubscribeOptions<TType>,
      >(
        topicOptions: TTopicOptionsProps<TType>,
        impl: TImpl,
        options?: TOptions,
      ) => Promise<void>;
    };
  }
}
