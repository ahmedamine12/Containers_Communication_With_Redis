const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const { promisify } = require('util');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

async function client() {
  const client = redis.createClient({
    url: "redis://rediscontainer:6379",
    socket: {
      connectTimeout: 60000,
      keepAlive: 60000,
    }
  });

  client.on('error', err => console.error('client error', err));
  client.on('connect', () => console.log('client is connect'));
  client.on('reconnecting', () => console.log('client is reconnecting'));
  client.on('ready', () => console.log('client is ready'));

  await client.connect();

  return client;
}

app.post('/submit', async (req, res, body) => {
  const formData = req.body;

  try {
    const cli = await client();
    await cli.set('formData', JSON.stringify(formData));
    console.log('Form data submitted to Redis successfully');
    res.send('Form data submitted to Redis successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting form data to Redis');
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
