/**
 * Migration Script: Update User Schema
 * 
 * This script adds missing fields to existing user documents:
 * - Adds totalLent field (default: 0)
 * - Adds behavioralData object (default: empty)
 * 
 * Run with: npx tsx scripts/migrate-user-schema.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function migrateUserSchema() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const usersCollection = db.collection('users');

    // Check if migration is needed
    const sampleUser = await usersCollection.findOne({});
    
    if (!sampleUser) {
      console.log('ℹ️  No users found in database. Migration not needed.');
      await mongoose.disconnect();
      return;
    }

    if (sampleUser.totalLent !== undefined && sampleUser.behavioralData !== undefined) {
      console.log('ℹ️  Users already migrated. Skipping migration.');
      await mongoose.disconnect();
      return;
    }

    console.log('🔄 Starting user schema migration...');

    // Migrate all users
    const result = await usersCollection.updateMany(
      {},
      {
        $set: {
          totalLent: { $ifNull: ['$totalLent', 0] },
        },
        $setOnInsert: {
          behavioralData: {},
        }
      }
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Matched: ${result.matchedCount} documents`);
    console.log(`   - Modified: ${result.modifiedCount} documents`);

    // Verify migration
    const verifyUser = await usersCollection.findOne({});
    if (verifyUser) {
      console.log('\n📋 Sample migrated user:');
      console.log(JSON.stringify({
        name: verifyUser.name,
        email: verifyUser.email,
        totalLent: verifyUser.totalLent,
        behavioralData: verifyUser.behavioralData,
      }, null, 2));
    }

    await mongoose.disconnect();
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateUserSchema();
