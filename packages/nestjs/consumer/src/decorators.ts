import { assignMetadata } from '@nestjs/common';

import type { TSubscribeType } from '@kafka-ts/core/lib/interface';

import type { ISubscribeParams } from './interface';

const PAYLOAD_TYPE = 3;
const CONTEXT_TYPE = 6;
const ROUTE_ARGS_METADATA = '__routeArguments__';
const PATTERN_METADATA = 'microservices:pattern';
const PATTERN_HANDLER_METADATA = 'microservices:handler_type';

function handleSubscribeParams<T extends TSubscribeType = 'batch_message'>(
  descriptor: PropertyDescriptor,
  params: ISubscribeParams<T>,
): void {
  Reflect.defineMetadata(
    PATTERN_METADATA,
    [
      {
        ...params,
        isKafka: true,
      },
    ],
    descriptor.value,
  );
  Reflect.defineMetadata(PATTERN_HANDLER_METADATA, 1, descriptor.value);
}

export function Subscribe(
  params: Omit<ISubscribeParams<'batch_message'>, 'type'>,
): MethodDecorator {
  return (
    _target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    handleSubscribeParams(descriptor, {
      ...params,
      type: 'batch_message',
    });

    return descriptor;
  };
}

export function SubscribeMessage(
  params: Omit<ISubscribeParams<'message'>, 'type'>,
): MethodDecorator {
  return (
    _target: object,
    _key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    handleSubscribeParams(descriptor, {
      ...params,
      type: 'message',
    });

    return descriptor;
  };
}

function createDecorator(type: number): () => ParameterDecorator {
  return (): ParameterDecorator => {
    return (target, key = '', index) => {
      Reflect.defineMetadata(
        ROUTE_ARGS_METADATA,
        assignMetadata(
          Reflect.getMetadata(ROUTE_ARGS_METADATA, target.constructor, key) ||
            {},
          type,
          index,
        ),
        target.constructor,
        key,
      );
    };
  };
}

export const Ctx = createDecorator(CONTEXT_TYPE);

export const Payload = createDecorator(PAYLOAD_TYPE);
