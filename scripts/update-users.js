const { MongoClient } = require('mongodb');

// Get the MongoDB URI from your .env file or use it directly here
const uri = 'mongodb+srv://wiselifepro:Spartan122!@cluster0.dzkxwqh.mongodb.net/Auralumic?retryWrites=true&w=majority&appName=Cluster0';

async function updateUsers() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('Auralumic');
    const users = db.collection('users');

    // Update all users to set hasCompletedOnboarding to false if it doesn't exist
    const result = await users.updateMany(
      { hasCompletedOnboarding: { $exists: false } },
      { $set: { hasCompletedOnboarding: false } }
    );

    console.log(`Updated ${result.modifiedCount} users`);
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateUsers();
