import type { Producer, RecordMetadata } from '@kafka-ts/core';

import type { IPublishParams } from '@kafka-ts/core/lib/interface';

export type TGetProducerFunc = (clientId?: string) => Producer;

export type TPublishFunc = (
  params: IPublishParams,
) => Promise<RecordMetadata[]>;
