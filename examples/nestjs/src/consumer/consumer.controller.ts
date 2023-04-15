import { Controller } from '@nestjs/common';
import {
  Ctx,
  Payload,
  Subscribe,
  SubscribeMessage,
  KafkaMessageContext,
  KafkaBatchMessageContext,
} from '@kafka-ts/nestjs-consumer';

@Controller()
export class ConsumerController {
  @Subscribe({
    topics: ['topic'],
  })
  public async handleSubscribe(
    @Payload() data: string[],
    @Ctx() context: KafkaBatchMessageContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context.batch', context.batch);

    return 'Ok!';
  }

  @SubscribeMessage({
    clientId: 'test-client',
    topics: ['topic_2'],
  })
  public async handleSubscribeMessage(
    @Payload() data: string,
    @Ctx() context: KafkaMessageContext,
  ): Promise<string> {
    console.log('data', data);
    console.log('context.message', context.message);

    return 'Ok!';
  }
}
