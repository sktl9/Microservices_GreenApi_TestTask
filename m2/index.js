const { consumeFromQueue, publishToQueue } = require('./modules/rabbitmq');

async function processTask(task) {
  console.log('Processing task:', task);


  const result = task.data * 2;


  const resultData = { taskId: task.taskId, result }; 
  await publishToQueue('result_queue', resultData);

  return result;
}

consumeFromQueue('task_queue', async (task) => {
  try {
    const result = await processTask(task);

    console.log('Task processing complete. Result:', result);
  } catch (error) {
    console.error('Error processing the task:', error);
  }
});