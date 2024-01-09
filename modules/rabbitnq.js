const amqp = require('amqplib');

const QUEUE_NAME = 'task_queue';

const RABBITMQ_URL = 'amqp://rabbitmq';


async function publishToQueue(queueName, data) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });

    console.log('Task published to the queue:', data);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error publishing to the queue:', error);
  }
}

async function consumeFromQueue(queueName, onMessageCallback) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });
    channel.prefetch(1);

    console.log('Waiting for messages from the queue...');

    channel.consume(
      queueName,
      async (msg) => {
        const data = JSON.parse(msg.content.toString());
        console.log('Task received from the queue:', data);

        // Process the task using the provided callback
        await onMessageCallback(data);

        channel.ack(msg);
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Error consuming from the queue:', error);
  }
}

module.exports = { publishToQueue, consumeFromQueue };