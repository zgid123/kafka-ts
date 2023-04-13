import type {
  Consumer,
  Producer,
  KafkaConfig,
  ProducerBatch,
  TopicMessages,
  ProducerConfig,
  ConsumerConfig,
  ConsumerRunConfig,
} from 'kafkajs';

interface IBrokerUrlProps {
  domain: string;
  port?: string | number;
}

export type TBrokers = (string | IBrokerUrlProps)[];

type TBrokersFunc = () => TBrokers | Promise<TBrokers>;

export interface IKafkaProps extends Omit<KafkaConfig, 'brokers'> {
  brokers: TBrokers | TBrokersFunc;
}

// internal type for internal packages

// consumer
export interface IKafkaConsumerProps extends IKafkaProps {
  consumerOptions: ConsumerConfig;
}

export type TSubscribeType = 'message' | 'batch_message';

export type TSubscribeOptions<T extends TSubscribeType> = Omit<
  ConsumerRunConfig,
  | (T extends 'message' ? 'eachBatchAutoResolve' : '')
  | 'eachBatch'
  | 'eachMessage'
>;

export interface IClientConsumerProps {
  [key: string]: Consumer;
}

interface IGroupedConsumerOptionsProps {
  [key: string]: ConsumerConfig;
}

export type TConsumerConvertedOptions = [
  IKafkaProps[],
  IGroupedConsumerOptionsProps,
];

// producer
export interface IKafkaProducerProps extends IKafkaProps {
  producerOptions?: ProducerConfig;
}

export interface IClientProducerProps {
  [key: string]: Producer;
}

interface IGroupedProducerOptionsProps {
  [key: string]: ProducerConfig;
}

export type TProducerConvertedOptions = [
  IKafkaProps[],
  IGroupedProducerOptionsProps,
];

export interface IPublishParams extends Omit<ProducerBatch, 'topicMessages'> {
  clientId?: string;
  topicMessages?: TopicMessages | TopicMessages[];
}
