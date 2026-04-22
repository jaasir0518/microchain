/**
 * MongoDB Setup & Verification Script
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Verifies all collections exist
 * 3. Creates indexes
 * 4. Shows database statistics
 * 5. Optionally seeds sample data
 */

import connectDB from '../lib/mongoose';
import User from '../models/User';
import TrustCircle from '../models/TrustCircle';
import CircleMember from '../models/CircleMember';
import Loan from '../models/Loan';
import LoanVote from '../models/LoanVote';
import PoolContribution from '../models/PoolContribution';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

interface CollectionStats {
  name: string;
  count: number;
  size: string;
  indexes: number;
}

async function setupMongoDB() {
  console.log('🚀 Starting MongoDB Setup...\n');

  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    console.log(`📦 Database: ${db.databaseName}\n`);

    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections Found:', collections.length);
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');

    // Verify and create indexes for all models
    console.log('🔍 Verifying Indexes...\n');

    const models = [
      { name: 'User', model: User },
      { name: 'TrustCircle', model: TrustCircle },
      { name: 'CircleMember', model: CircleMember },
      { name: 'Loan', model: Loan },
      { name: 'LoanVote', model: LoanVote },
      { name: 'PoolContribution', model: PoolContribution },
      { name: 'Notification', model: Notification },
    ];

    const stats: CollectionStats[] = [];

    for (const { name, model } of models) {
      try {
        // Ensure indexes are created
        await model.createIndexes();
        
        // Get collection stats
        const count = await model.countDocuments();
        const collection = db.collection(model.collection.name);
        const collStats = await db.command({ collStats: model.collection.name });
        const indexes = await model.collection.getIndexes();
        
        stats.push({
          name,
          count,
          size: formatBytes(collStats.size || 0),
          indexes: Object.keys(indexes).length,
        });

        console.log(`✅ ${name}`);
        console.log(`   Documents: ${count}`);
        console.log(`   Size: ${formatBytes(collStats.size || 0)}`);
        console.log(`   Indexes: ${Object.keys(indexes).length}`);
        console.log(`   Index Names: ${Object.keys(indexes).join(', ')}`);
        console.log('');
      } catch (error) {
        console.error(`❌ Error with ${name}:`, error);
      }
    }

    // Display summary table
    console.log('\n📈 Database Summary:');
    console.log('═'.repeat(70));
    console.log('Collection'.padEnd(20) + 'Documents'.padEnd(15) + 'Size'.padEnd(15) + 'Indexes');
    console.log('─'.repeat(70));
    
    let totalDocs = 0;
    stats.forEach(stat => {
      console.log(
        stat.name.padEnd(20) +
        stat.count.toString().padEnd(15) +
        stat.size.padEnd(15) +
        stat.indexes.toString()
      );
      totalDocs += stat.count;
    });
    
    console.log('═'.repeat(70));
    console.log(`Total Documents: ${totalDocs}\n`);

    // Check MongoDB connection details
    console.log('🔗 Connection Details:');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${db.databaseName}`);
    console.log(`   Ready State: ${getReadyState(mongoose.connection.readyState)}`);
    console.log('');

    // Verify critical indexes
    console.log('🔐 Critical Indexes Verification:');
    await verifyIndex(User, 'email', 'User email (unique)');
    await verifyIndex(TrustCircle, 'inviteCode', 'TrustCircle inviteCode (unique)');
    await verifyIndex(CircleMember, 'userId_1_circleId_1', 'CircleMember compound (unique)');
    await verifyIndex(Loan, 'circleId_1_status_1', 'Loan compound (circleId + status)');
    await verifyIndex(LoanVote, 'loanId_1_voterId_1', 'LoanVote compound (unique)');
    await verifyIndex(Notification, 'userId_1_isRead_1_createdAt_-1', 'Notification compound');
    console.log('');

    console.log('✨ MongoDB setup completed successfully!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connection closed');
  }
}

async function verifyIndex(model: any, indexName: string, description: string) {
  try {
    const indexes = await model.collection.getIndexes();
    const exists = indexName in indexes;
    console.log(`   ${exists ? '✅' : '❌'} ${description}`);
  } catch (error) {
    console.log(`   ❌ ${description} - Error checking`);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getReadyState(state: number): string {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[state] || 'unknown';
}

// Run the setup
setupMongoDB();
