import { Controller, Get } from '@nestjs/common';
import { KafkaModel } from '@kafka-ts/nestjs-producer';

@Controller('/producer')
export class ProducerController {
  constructor(private readonly kafkaModel: KafkaModel) {}

  @Get()
  public async publish(): Promise<string> {
    this.kafkaModel
      .publish({
        topicMessages: [
          {
            topic: 'topic',
            messages: [
              {
                value: 'hello',
              },
            ],
          },
        ],
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });

    return 'Ok!';
  }

  @Get('message')
  public async publishMessage(): Promise<string> {
    this.kafkaModel
      .publish({
        topicMessages: {
          topic: 'topic_2',
          messages: [
            {
              value: 'hi',
            },
          ],
        },
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });

    return 'Ok!';
  }
}
