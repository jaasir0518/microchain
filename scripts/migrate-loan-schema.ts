/**
 * Migration Script: Update Loan Schema
 * 
 * This script migrates existing loan documents to the new schema:
 * - Renames circleId → circle
 * - Renames userId → borrower
 * - Adds missing fields (lender, fundedAt, durationDays, votes)
 * 
 * Run with: npx tsx scripts/migrate-loan-schema.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function migrateLoanSchema() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const loansCollection = db.collection('loans');

    // Check if migration is needed
    const sampleLoan = await loansCollection.findOne({});
    
    if (!sampleLoan) {
      console.log('ℹ️  No loans found in database. Migration not needed.');
      await mongoose.disconnect();
      return;
    }

    if (sampleLoan.circle && sampleLoan.borrower) {
      console.log('ℹ️  Loans already migrated. Skipping migration.');
      await mongoose.disconnect();
      return;
    }

    console.log('🔄 Starting loan schema migration...');

    // Migrate all loans
    const result = await loansCollection.updateMany(
      {},
      [
        {
          $set: {
            // Rename fields
            circle: { $ifNull: ['$circle', '$circleId'] },
            borrower: { $ifNull: ['$borrower', '$userId'] },
            
            // Add new fields if they don't exist
            durationDays: { $ifNull: ['$durationDays', 30] },
            votes: { $ifNull: ['$votes', []] },
          }
        },
        {
          $unset: ['circleId', 'userId']
        }
      ]
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Matched: ${result.matchedCount} documents`);
    console.log(`   - Modified: ${result.modifiedCount} documents`);

    // Verify migration
    const verifyLoan = await loansCollection.findOne({});
    console.log('\n📋 Sample migrated loan:');
    console.log(JSON.stringify(verifyLoan, null, 2));

    await mongoose.disconnect();
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateLoanSchema();
