const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://mongocontainer:27017/mydatabase';



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

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
console.log("heloooo");
app.post('/submit', (req, res, body) => {
  console.log('Form submitted');
  try {
    const cli = client();
    const formDataStr = cli.getAsync('formData');

    console.log('Form data retrieved from Redis:', formDataStr);
    const formData = JSON.parse(formDataStr);
    const db = MongoClient.connect(url);
    const collection = db.collection('mycollection');
    const result = collection.insertOne(formData);
    console.log('Form data inserted into MongoDB:', result);
    db.close();
    client.delAsync('formData');
    console.log('Form data deleted from Redis');
    res.send('Form submitted successfully!');
  } catch (err) {
    console.error(err);
    res.send('Error retrieving form data from Redis');
  }
});

app.listen(3002, () => {
  console.log('Server started on port 3002');
});
