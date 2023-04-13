import type {
  Batch,
  Offsets,
  KafkaMessage,
  EachBatchPayload,
  EachMessagePayload,
  OffsetsByTopicPartition,
} from 'kafkajs';

interface IBaseContextProps {
  pause: () => void;
  heartbeat: () => Promise<void>;
}

class KafkaContext {
  #pause: IBaseContextProps['pause'];
  #heartbeat: IBaseContextProps['heartbeat'];

  constructor({ pause, heartbeat }: IBaseContextProps) {
    this.#pause = pause;
    this.#heartbeat = heartbeat;
  }

  public pause(): void {
    return this.#pause();
  }

  public heartbeat(): Promise<void> {
    return this.#heartbeat();
  }
}

export class KafkaBatchMessageContext extends KafkaContext {
  #batch: Batch;
  #isStale: EachBatchPayload['isStale'];
  #isRunning: EachBatchPayload['isRunning'];
  #resolveOffset: EachBatchPayload['resolveOffset'];
  #uncommittedOffsets: EachBatchPayload['uncommittedOffsets'];
  #commitOffsetsIfNecessary: EachBatchPayload['commitOffsetsIfNecessary'];

  constructor({
    pause,
    batch,
    isStale,
    heartbeat,
    isRunning,
    resolveOffset,
    uncommittedOffsets,
    commitOffsetsIfNecessary,
  }: EachBatchPayload) {
    super({
      pause,
      heartbeat,
    });

    this.#batch = batch;
    this.#isStale = isStale;
    this.#isRunning = isRunning;
    this.#resolveOffset = resolveOffset;
    this.#uncommittedOffsets = uncommittedOffsets;
    this.#commitOffsetsIfNecessary = commitOffsetsIfNecessary;
  }

  public get batch(): Batch {
    return this.#batch;
  }

  public resolveOffset(offset: string): void {
    return this.#resolveOffset(offset);
  }

  public commitOffsetsIfNecessary(offsets?: Offsets): Promise<void> {
    return this.#commitOffsetsIfNecessary(offsets);
  }

  public uncommittedOffsets(): OffsetsByTopicPartition {
    return this.#uncommittedOffsets();
  }

  public get isRunning(): boolean {
    return this.#isRunning();
  }

  public get isStale(): boolean {
    return this.#isStale();
  }
}

export class KafkaMessageContext extends KafkaContext {
  #topic: string;
  #partition: number;
  #message: KafkaMessage;

  constructor({
    topic,
    pause,
    message,
    heartbeat,
    partition,
  }: EachMessagePayload) {
    super({
      pause,
      heartbeat,
    });

    this.#topic = topic;
    this.#message = message;
    this.#partition = partition;
  }

  public get topic(): string {
    return this.#topic;
  }

  public get message(): KafkaMessage {
    return this.#message;
  }

  public get partition(): number {
    return this.#partition;
  }
}
