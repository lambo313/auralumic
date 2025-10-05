const { MongoClient } = require('mongodb');

// Get the MongoDB URI from your .env file or use it directly here
const uri = 'mongodb+srv://wiselifepro:Spartan122!@Cluster0.dzkxwqh.mongodb.net/Auralumic?retryWrites=true&w=majority&appName=Cluster0';

async function makeUserAdmin() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('Auralumic');
    const users = db.collection('users');

    // If you know the user's email, replace it here
    const userEmail = process.argv[2]; // Pass email as command line argument
    const userClerkId = process.argv[3]; // Pass Clerk ID as command line argument

    if (!userEmail && !userClerkId) {
      console.log('Usage: node make-admin.js <email> [clerkId]');
      console.log('   or: node make-admin.js "" <clerkId>');
      console.log('Example: node make-admin.js user@example.com');
      console.log('Example: node make-admin.js "" user_2abc123def');
      return;
    }

    let query = {};
    if (userEmail) {
      query.email = userEmail;
    } else if (userClerkId) {
      query.clerkId = userClerkId;
    }

    // First, find the user
    const user = await users.findOne(query);
    
    if (!user) {
      console.log(`User not found with the provided criteria`);
      return;
    }

    console.log(`Found user: ${user.email} (${user.username || 'no username'})`);
    console.log(`Current role: ${user.role}`);

    // Update user role to admin
    const result = await users.updateOne(
      { _id: user._id },
      { 
        $set: { 
          role: 'admin',
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Successfully made ${user.email} an admin!`);
    } else {
      console.log(`❌ Failed to update user role`);
    }

  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

makeUserAdmin();