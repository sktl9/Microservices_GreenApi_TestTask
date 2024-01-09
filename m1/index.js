const express = require('express');
const { publishToQueue, consumeFromQueue } = require('./modules/rabbitmq');

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/process', async (req, res) => {

  const taskData = req.body;

  publishToQueue('task_queue', taskData);


  const resultData = await new Promise((resolve) => {
    consumeFromQueue('result_queue', (result) => {
      resolve(result);
    });
  });

  res.json({ result: resultData.result });
});

app.listen(PORT, () => {
  console.log(`Microservice M1 listening on port ${PORT}`);
});