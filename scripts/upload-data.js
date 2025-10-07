const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

async function uploadData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Read JSON files
    const attributesPath = path.join(__dirname, '../data/attributes.json');
    const badgesPath = path.join(__dirname, '../data/badges.json');
    const categoriesPath = path.join(__dirname, '../data/categories.json');
    
    const attributesData = JSON.parse(fs.readFileSync(attributesPath, 'utf8'));
    const badgesData = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    // Upload Abilities
    console.log('Uploading abilities...');
    const abilitiesCollection = db.collection('abilities');
    await abilitiesCollection.deleteMany({}); // Clear existing data
    if (attributesData.Abilities && attributesData.Abilities.length > 0) {
      await abilitiesCollection.insertMany(attributesData.Abilities);
      console.log(`Uploaded ${attributesData.Abilities.length} abilities`);
    }
    
    // Upload Tools
    console.log('Uploading tools...');
    const toolsCollection = db.collection('tools');
    await toolsCollection.deleteMany({}); // Clear existing data
    if (attributesData.Tools && attributesData.Tools.length > 0) {
      await toolsCollection.insertMany(attributesData.Tools);
      console.log(`Uploaded ${attributesData.Tools.length} tools`);
    }
    
    // Upload Styles
    console.log('Uploading styles...');
    const stylesCollection = db.collection('styles');
    await stylesCollection.deleteMany({}); // Clear existing data
    if (attributesData.Styles && attributesData.Styles.length > 0) {
      await stylesCollection.insertMany(attributesData.Styles);
      console.log(`Uploaded ${attributesData.Styles.length} styles`);
    }
    
    // Upload Badges
    console.log('Uploading badges...');
    const badgesCollection = db.collection('badges');
    await badgesCollection.deleteMany({}); // Clear existing data
    if (badgesData.badges && badgesData.badges.length > 0) {
      await badgesCollection.insertMany(badgesData.badges);
      console.log(`Uploaded ${badgesData.badges.length} badges`);
    }
    
    // Upload Categories
    console.log('Uploading categories...');
    const categoriesCollection = db.collection('categories');
    await categoriesCollection.deleteMany({}); // Clear existing data
    if (categoriesData.categories && categoriesData.categories.length > 0) {
      await categoriesCollection.insertMany(categoriesData.categories);
      console.log(`Uploaded ${categoriesData.categories.length} categories`);
    }
    
    console.log('All data uploaded successfully!');
    
  } catch (error) {
    console.error('Error uploading data:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the upload
uploadData().catch(console.error);