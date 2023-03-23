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
async function insertdata(formData) {
  MongoClient.connect(url)
    .then((client) => {
      console.log('Connected successfully to server');
      const db = client.db('mydatabase');
      const collection = db.collection('mycollection');

      console.log('Form data:', formData);
      collection.insertOne(formData, (err, result) => {
        if (err) {
          console.log('Error inserting form data:', err);
        } else {
          console.log('Form data inserted:', result);
        }
      });


    })
    .catch((error) => {
      console.log('Error connecting to MongoDB:', error);
    });
}
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', async (req, res, body) => {
  console.log('Form submitted');
  try {
    const cli = await client();
    const formDataStr = await cli.get('formData');
    console.log('Form data retrieved from Redis:', formDataStr);
    const formData = JSON.parse(formDataStr);
    await insertdata(formData);

    db.close();
    await cli.del('formData');
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
