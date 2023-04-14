import type { ConsumerSubscribeTopics } from '@kafka-ts/core';
import type {
  TSubscribeType,
  TSubscribeOptions,
} from '@kafka-ts/core/lib/interface';

export interface ISubscribeParams<
  TType extends TSubscribeType = 'batch_message',
> extends ConsumerSubscribeTopics {
  type?: TType;
  clientId?: string;
  options?: TSubscribeOptions<TType>;
}
