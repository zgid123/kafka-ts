import { Logger } from '@nestjs/common';
import { createConsumers } from '@kafka-ts/consumer-commons';
import {
  parseMessage,
  DEFAULT_CLIENT,
  KafkaMessageContext,
  KafkaBatchMessageContext,
  type ConsumerRunConfig,
} from '@kafka-ts/core';

import type {
  IKafkaConsumerProps,
  IClientConsumerProps,
} from '@kafka-ts/core/lib/interface';

import { normalizePattern, omit } from './utils';

import type { ISubscribeParams } from './interface';

type TCallback = () => void;

interface ICreateServiceReturnProps {
  strategy: KafkaConsumer;
}

interface IMessageHandlerProps<TData = unknown, TResult = unknown> {
  (
    data: TData,
    ctx?: KafkaBatchMessageContext | KafkaMessageContext,
  ): Promise<TResult>;
}

type TOptions = IKafkaConsumerProps | IKafkaConsumerProps[];

export class KafkaConsumer {
  #options: TOptions;
  #clientConsumers: IClientConsumerProps = {};
  #patterns: ISubscribeParams[] = [];
  #logger = new Logger('KafkaConsumer');
  #messageHandlers = new Map<string, IMessageHandlerProps>();

  constructor(props: TOptions) {
    this.#options = props;
  }

  public static createService(params: TOptions): ICreateServiceReturnProps {
    return {
      strategy: new KafkaConsumer(params),
    };
  }

  public addHandler(
    pattern: ISubscribeParams & { isKafka: boolean },
    callback: IMessageHandlerProps,
    _isEventHandler = false,
    _extras: Record<string, any> = {},
  ) {
    if (typeof pattern === 'object' && pattern.isKafka) {
      pattern = omit(pattern, ['isKafka']) as ISubscribeParams & {
        isKafka: boolean;
      };

      this.#patterns.push(pattern);
    }

    const normalizedPattern = normalizePattern(pattern);
    this.#messageHandlers.set(normalizedPattern, callback);
  }

  public async listen(callback: TCallback) {
    const patterns = this.#patterns;
    const handleMessage = this.#handleMessage.bind(this);

    await this.#initClientConsumers(this.#options);

    patterns.forEach(async (pattern) => {
      const {
        type,
        topics,
        options = {},
        fromBeginning,
        clientId = DEFAULT_CLIENT,
      } = pattern;
      const consumer = this.#clientConsumers[clientId];

      if (!consumer) {
        return this.#logger.error(`Unknown client ${clientId}`);
      }

      await consumer.subscribe({
        topics,
        fromBeginning,
      });

      let providedOpts: ConsumerRunConfig = {};

      if (type === 'batch_message') {
        providedOpts = {
          eachBatch: async ({ batch, ...rest }) => {
            const { messages } = batch;
            const context = new KafkaBatchMessageContext({
              ...rest,
              batch,
            });

            const formattedMessages = messages.map((message) => {
              return parseMessage(message);
            });

            return handleMessage(formattedMessages, context, pattern);
          },
        };
      } else {
        providedOpts = {
          eachMessage: async ({ message, ...rest }) => {
            const context = new KafkaMessageContext({
              ...rest,
              message,
            });

            return handleMessage(parseMessage(message), context, pattern);
          },
        };
      }

      consumer.run({
        ...options,
        ...providedOpts,
      });
    });

    callback();
  }

  public async close() {
    Object.values(this.#clientConsumers).forEach((consumer) => {
      consumer.disconnect();
    });
  }

  async #handleMessage(
    message: unknown | unknown[],
    context: KafkaBatchMessageContext | KafkaMessageContext,
    pattern: ISubscribeParams,
  ): Promise<void> {
    if (message === null) {
      return;
    }

    const patternAsString = normalizePattern(pattern);
    const handler = this.#messageHandlers.get(patternAsString);

    if (!handler) {
      return this.#logger.error(
        `There is no matching event handler defined in the consumer. Event pattern: ${patternAsString}`,
      );
    }

    return handler(message, context) as Promise<void>;
  }

  async #initClientConsumers(options: TOptions): Promise<void> {
    this.#clientConsumers = await createConsumers(options);
  }
}
