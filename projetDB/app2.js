const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const redis = require('redis');

const url = 'mongodb://mongocontainer:27017/mydatabase';
const client = redis.createClient({
  host: 'rediscontainer',
  port: 6379,
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', async (req, res) => {
  console.log('Form submitted');
  try {
    const formDataStr = await client.getAsync('formData');
    console.log('Form data retrieved:', formDataStr);
    const formData = JSON.parse(formDataStr);
    const db = await MongoClient.connect(url);
    const collection = db.collection('mycollection');
    const result = await collection.insertOne(formData);
    console.log('Form data inserted:', result);
    db.close();
    res.send('Form submitted successfully!');
  } catch (err) {
    console.error(err);
    res.send('Error retrieving form data from Redis');
  }
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
