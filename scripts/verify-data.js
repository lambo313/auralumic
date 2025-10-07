const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

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

async function verifyData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('\n🔍 Sample Data Verification:\n');
    
    // Show sample abilities
    console.log('📋 Sample Abilities:');
    const abilities = await Ability.find().limit(3).lean();
    abilities.forEach(ability => {
      console.log(`  - ${ability.name}: ${ability.description}`);
    });
    
    // Show sample tools
    console.log('\n🔧 Sample Tools:');
    const tools = await Tool.find().limit(3).lean();
    tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    
    // Show sample styles
    console.log('\n🎨 Sample Styles:');
    const styles = await Style.find().limit(3).lean();
    styles.forEach(style => {
      console.log(`  - ${style.name}: ${style.description}`);
    });
    
    // Show sample badges
    console.log('\n🏆 Sample Badges:');
    const badges = await Badge.find().limit(3).lean();
    badges.forEach(badge => {
      console.log(`  - ${badge.name} (${badge.tier}): ${badge.description}`);
    });
    
    // Show sample categories
    console.log('\n📂 Sample Categories:');
    const categories = await Category.find().limit(3).lean();
    categories.forEach(category => {
      console.log(`  - ${category.name}: ${category.description} (Active: ${category.isActive})`);
    });
    
    console.log('\n✅ Data verification complete!');
    
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the verification
verifyData().catch(console.error);