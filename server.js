const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // better than body-parser (already included in Express)

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(mongoUri);
const dbName = 'passguard';
let db;

// Connect to MongoDB properly
async function connectDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}
connectDB();

const port = 3000;

// Routes

// Get all passwords
app.get('/', async (req, res) => {
  try {
    const collection = db.collection('passwords');
    const allPasswords = await collection.find({}).toArray();
    res.json(allPasswords);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Save a password
app.post('/', async (req, res) => {
  try {
    const passwordData = req.body;
    if (!passwordData || Object.keys(passwordData).length === 0) {
      return res.status(400).send({ success: false, message: 'Password data missing' });
    }
    const collection = db.collection('passwords');
    const result = await collection.insertOne(passwordData);
    res.send({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Delete a password
app.delete('/', async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) {
      return res.status(400).send({ success: false, message: 'UUID is required for deletion' });
    }
    const collection = db.collection('passwords');
    const result = await collection.deleteOne({ uuid });
    res.send({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
