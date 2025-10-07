# Data Migration Scripts

This directory contains scripts to migrate data from JSON files to MongoDB collections.

## Scripts Available

### 1. `upload-data.js`
Basic MongoDB client script that uploads data directly to collections.

### 2. `upload-data-mongoose.js` (Recommended)
Uses Mongoose with proper schema validation and provides verification of uploaded data.

## Usage

### Prerequisites
1. Ensure your MongoDB connection is configured in `.env.local`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   # or
   DATABASE_URL=your_mongodb_connection_string
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Scripts

#### Option 1: Using npm scripts (Recommended)
```bash
# Upload using Mongoose (recommended)
npm run upload-data-mongoose

# Upload using basic MongoDB client
npm run upload-data
```

#### Option 2: Direct execution
```bash
# Upload using Mongoose
node scripts/upload-data-mongoose.js

# Upload using basic MongoDB client
node scripts/upload-data.js
```

## What Gets Uploaded

The scripts will upload the following data from the `data/` directory:

### From `attributes.json`:
- **Abilities** → `abilities` collection
- **Tools** → `tools` collection  
- **Styles** → `styles` collection

### From `badges.json`:
- **Badges** → `badges` collection

### From `categories.json`:
- **Categories** → `categories` collection

## Important Notes

⚠️ **Warning**: These scripts will **DELETE ALL EXISTING DATA** in the target collections before uploading new data.

✅ **Verification**: The Mongoose script includes verification that shows the count of uploaded documents.

🔄 **Schema Validation**: The Mongoose script uses the same schemas as your application models, ensuring data integrity.

## Troubleshooting

### Common Issues

1. **Connection Error**: Make sure your `MONGODB_URI` is correct in `.env.local`
2. **Permission Error**: Ensure your MongoDB user has read/write permissions
3. **Schema Validation Error**: Check that your JSON data matches the expected schema format

### Success Output
You should see output similar to:
```
Connected to MongoDB with Mongoose
Uploading abilities...
✅ Uploaded 8 abilities
Uploading tools...
✅ Uploaded 9 tools
Uploading styles...
✅ Uploaded 3 styles
Uploading badges...
✅ Uploaded 66 badges
Uploading categories...
✅ Uploaded 8 categories
🎉 All data uploaded successfully with Mongoose!

📊 Verification:
Abilities count: 8
Tools count: 9
Styles count: 3
Badges count: 66
Categories count: 8
```