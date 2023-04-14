import type {
  Consumer,
  KafkaMessageContext,
  ConsumerSubscribeTopics,
  KafkaBatchMessageContext,
} from '@kafka-ts/core';

import type {
  TSubscribeType,
  TSubscribeOptions,
} from '@kafka-ts/core/lib/interface';

export type TGetConsumerFunc = (clientId?: string) => Consumer;

export type TTopicOptionsProps<TType extends TSubscribeType = TSubscribeType> =
  ConsumerSubscribeTopics & {
    clientId?: string;
  } & (TType extends 'batch_message'
      ? {
          type?: TType;
        }
      : {
          type: TType;
        });

type TBatchMessageImplFunc<TData = unknown> = (
  messages: TData[],
  context: KafkaBatchMessageContext,
) => Promise<void> | void;

type TMessageImplFunc<TData = unknown> = (
  message: TData,
  context: KafkaMessageContext,
) => Promise<void> | void;

export type TImplFunc<
  TData = unknown,
  TType extends TSubscribeType | undefined = 'batch_message',
> = TType extends 'message'
  ? TMessageImplFunc<TData>
  : TBatchMessageImplFunc<TData>;

export type TSubscribeFunc<
  TData = unknown,
  TType extends TSubscribeType = 'batch_message',
  TImpl extends TImplFunc<TData, TType> = TImplFunc<TData, TType>,
  TOptions extends TSubscribeOptions<TType> = TSubscribeOptions<TType>,
> = (
  topicOptions: TTopicOptionsProps<TType>,
  impl: TImpl,
  options?: TOptions,
) => Promise<void>;
