const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env');
}

// Define schemas (matching the TypeScript models)
const abilitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true }
}, { timestamps: true });

const toolSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true }
}, { timestamps: true });

const styleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true }
}, { timestamps: true });

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  attribute: { type: String, required: true, trim: true },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold'], required: true },
  requirements: {
    readingsCompleted: { type: Number, required: true },
    averageRating: { type: Number, required: true },
    timeframe: { type: Number, required: true }
  },
  icon: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true }
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  icon: { type: String, required: true, trim: true },
  isActive: { type: Boolean, required: true, default: true }
}, { timestamps: true });

// Create models
const Ability = mongoose.model('Ability', abilitySchema);
const Tool = mongoose.model('Tool', toolSchema);
const Style = mongoose.model('Style', styleSchema);
const Badge = mongoose.model('Badge', badgeSchema);
const Category = mongoose.model('Category', categorySchema);

async function uploadDataWithMongoose() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB with Mongoose');
    
    // Read JSON files
    const attributesPath = path.join(__dirname, '../data/attributes.json');
    const badgesPath = path.join(__dirname, '../data/badges.json');
    const categoriesPath = path.join(__dirname, '../data/categories.json');
    
    const attributesData = JSON.parse(fs.readFileSync(attributesPath, 'utf8'));
    const badgesData = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
    const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    
    // Upload Abilities
    console.log('Uploading abilities...');
    await Ability.deleteMany({});
    if (attributesData.Abilities && attributesData.Abilities.length > 0) {
      await Ability.insertMany(attributesData.Abilities);
      console.log(`✅ Uploaded ${attributesData.Abilities.length} abilities`);
    }
    
    // Upload Tools
    console.log('Uploading tools...');
    await Tool.deleteMany({});
    if (attributesData.Tools && attributesData.Tools.length > 0) {
      await Tool.insertMany(attributesData.Tools);
      console.log(`✅ Uploaded ${attributesData.Tools.length} tools`);
    }
    
    // Upload Styles
    console.log('Uploading styles...');
    await Style.deleteMany({});
    if (attributesData.Styles && attributesData.Styles.length > 0) {
      await Style.insertMany(attributesData.Styles);
      console.log(`✅ Uploaded ${attributesData.Styles.length} styles`);
    }
    
    // Upload Badges
    console.log('Uploading badges...');
    await Badge.deleteMany({});
    if (badgesData.badges && badgesData.badges.length > 0) {
      await Badge.insertMany(badgesData.badges);
      console.log(`✅ Uploaded ${badgesData.badges.length} badges`);
    }
    
    // Upload Categories
    console.log('Uploading categories...');
    await Category.deleteMany({});
    if (categoriesData.categories && categoriesData.categories.length > 0) {
      await Category.insertMany(categoriesData.categories);
      console.log(`✅ Uploaded ${categoriesData.categories.length} categories`);
    }
    
    console.log('🎉 All data uploaded successfully with Mongoose!');
    
    // Verify data was uploaded
    console.log('\n📊 Verification:');
    console.log(`Abilities count: ${await Ability.countDocuments()}`);
    console.log(`Tools count: ${await Tool.countDocuments()}`);
    console.log(`Styles count: ${await Style.countDocuments()}`);
    console.log(`Badges count: ${await Badge.countDocuments()}`);
    console.log(`Categories count: ${await Category.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error uploading data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the upload
uploadDataWithMongoose().catch(console.error);