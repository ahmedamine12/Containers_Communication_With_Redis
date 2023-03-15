const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const { promisify } = require('util');

const app = express();
const client = redis.createClient('redis://rediscontainer:6379');


client.on('error', (err) => {
  console.log('Error ' + err);
});

const setAsync = promisify(client.set).bind(client);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/submit', async (req, res) => {
  const formData = req.body;
  try {
    await setAsync('formData', JSON.stringify(formData));
    console.log('Form data submitted successfully');
    res.send('Form data submitted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting form');
  }
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
