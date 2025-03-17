require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Webhook } = require('svix');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // Store raw body for verification
  }
}));

// MongoDB connection setup
const uri = 'mongodb+srv://abdhackiabd:abdalmajeed@cluster0.jk8s0.mongodb.net/gamecart';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db('gamecart');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Webhook endpoint to handle Clerk events
app.post('/webhook/clerk', async (req, res) => {
  const payload = req.rawBody;
  const svixHeaders = {
    'svix-id': req.headers['svix-id'],
    'svix-timestamp': req.headers['svix-timestamp'],
    'svix-signature': req.headers['svix-signature'],
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  try {
    const event = wh.verify(payload, svixHeaders);
    switch (event.type) {
      case 'user.created':
      case 'user.updated':
        const user = event.data;
        await saveUserToMongoDB(user);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook verification failed:', error);
    res.status(400).send('Webhook verification failed');
  }
});

// Function to save or update user in MongoDB
async function saveUserToMongoDB(user) {
  try {
    const collection = db.collection('users');
    await collection.updateOne(
      { _id: user.id },
      { $set: user },
      { upsert: true }
    );
    console.log(`User ${user.id} saved/updated in MongoDB`);
  } catch (error) {
    console.error('Failed to save user to MongoDB:', error);
  }
}

// Start the server after connecting to database
async function startServer() {
  await connectToDatabase();
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();