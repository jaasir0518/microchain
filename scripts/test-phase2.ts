/**
 * Phase 2 Feature Testing Script
 * Tests all Priority 2 Extra Features
 * 
 * Run: npx ts-node scripts/test-phase2.ts
 */

import mongoose from 'mongoose';
import User from '../models/User';
import TrustCircle from '../models/TrustCircle';
import CircleMember from '../models/CircleMember';
import Loan from '../models/Loan';
import LoanVote from '../models/LoanVote';
import PoolContribution from '../models/PoolContribution';
import Notification from '../models/Notification';
import { createNotification, NotificationTemplates } from '../lib/notifications';
import { updateTrustScore } from '../lib/trust-utils';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/microchain';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testNotifications() {
  console.log('\n📢 Testing Notifications...');
  
  try {
    // Find a test user
    const user = await User.findOne();
    if (!user) {
      console.log('⚠️  No users found. Create a user first.');
      return;
    }

    // Create test notification
    const notification = await createNotification({
      userId: user._id,
      type: 'trust_score_change',
      title: 'Test Notification',
      message: 'This is a test notification from Phase 2',
      metadata: { test: true },
    });

    console.log('✅ Notification created:', notification._id);

    // Count notifications
    const count = await Notification.countDocuments({ userId: user._id });
    console.log(`✅ Total notifications for user: ${count}`);

    // Count unread
    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });
    console.log(`✅ Unread notifications: ${unreadCount}`);
  } catch (error) {
    console.error('❌ Notification test failed:', error);
  }
}

async function testPoolContribution() {
  console.log('\n💰 Testing Pool Contributions...');
  
  try {
    // Find a circle and member
    const circle = await TrustCircle.findOne();
    if (!circle) {
      console.log('⚠️  No circles found. Create a circle first.');
      return;
    }

    const member = await CircleMember.findOne({ circleId: circle._id, isActive: true });
    if (!member) {
      console.log('⚠️  No members found in circle.');
      return;
    }

    // Create contribution
    const contribution = await PoolContribution.create({
      circleId: circle._id,
      userId: member.userId,
      amount: 1000,
      trustScoreBonus: 3,
    });

    console.log('✅ Contribution recorded:', contribution._id);

    // Get total contributions
    const total = await PoolContribution.aggregate([
      { $match: { circleId: circle._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    console.log(`✅ Total contributions for circle: ₹${total[0]?.total || 0}`);
  } catch (error) {
    console.error('❌ Pool contribution test failed:', error);
  }
}

async function testVotingSystem() {
  console.log('\n🗳️  Testing Voting System...');
  
  try {
    // Find a loan in voting status
    let loan = await Loan.findOne({ status: 'voting' });
    
    if (!loan) {
      // Create a test loan in voting status
      const user = await User.findOne();
      const circle = await TrustCircle.findOne();
      
      if (!user || !circle) {
        console.log('⚠️  Need user and circle to test voting.');
        return;
      }

      loan = await Loan.create({
        circleId: circle._id,
        userId: user._id,
        amount: 3000,
        purpose: 'Test voting loan',
        trustScoreAtRequest: 60,
        status: 'voting',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      console.log('✅ Test loan created for voting:', loan._id);
    }

    // Count votes
    const voteCount = await LoanVote.countDocuments({ loanId: loan._id });
    console.log(`✅ Current votes: ${voteCount}`);

    // Get vote breakdown
    const votes = await LoanVote.find({ loanId: loan._id });
    const approveCount = votes.filter((v) => v.vote === 'approve').length;
    const rejectCount = votes.filter((v) => v.vote === 'reject').length;

    console.log(`✅ Approve: ${approveCount}, Reject: ${rejectCount}`);

    // Check if voting is complete
    const totalMembers = await CircleMember.countDocuments({
      circleId: loan.circleId,
      isActive: true,
    });
    const eligibleVoters = totalMembers - 1;

    console.log(`✅ Eligible voters: ${eligibleVoters}`);
    console.log(`✅ Voting complete: ${voteCount >= eligibleVoters ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error('❌ Voting system test failed:', error);
  }
}

async function testAnalytics() {
  console.log('\n📊 Testing Analytics...');
  
  try {
    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.log('⚠️  No users found.');
      return;
    }

    // Personal stats
    const loans = await Loan.find({ userId: user._id });
    const contributions = await PoolContribution.find({ userId: user._id });

    console.log(`✅ User: ${user.name}`);
    console.log(`✅ Trust Score: ${user.trustScore}`);
    console.log(`✅ Total Loans: ${loans.length}`);
    console.log(`✅ Total Contributions: ${contributions.length}`);
    console.log(
      `✅ Total Contributed: ₹${contributions.reduce((sum, c) => sum + c.amount, 0)}`
    );

    // Circle stats
    const circle = await TrustCircle.findOne();
    if (circle) {
      const circleLoans = await Loan.find({ circleId: circle._id });
      const circleContributions = await PoolContribution.find({ circleId: circle._id });

      console.log(`\n✅ Circle: ${circle.name}`);
      console.log(`✅ Pool Balance: ₹${circle.poolBalance}`);
      console.log(`✅ Total Loans: ${circleLoans.length}`);
      console.log(`✅ Total Contributions: ${circleContributions.length}`);
    }
  } catch (error) {
    console.error('❌ Analytics test failed:', error);
  }
}

async function testTrustScoreLogic() {
  console.log('\n🎯 Testing Trust Score Logic...');
  
  try {
    const users = await User.find().limit(5);
    
    console.log('\nTrust Score → Loan Status Mapping:');
    console.log('─'.repeat(50));
    
    for (const user of users) {
      let status = '';
      if (user.trustScore >= 70) status = 'Auto-approved ✅';
      else if (user.trustScore >= 55) status = 'Goes to voting 🗳️';
      else status = 'Auto-rejected ❌';
      
      console.log(`${user.name.padEnd(20)} | Score: ${user.trustScore} | ${status}`);
    }
  } catch (error) {
    console.error('❌ Trust score logic test failed:', error);
  }
}

async function showStatistics() {
  console.log('\n📈 Database Statistics:');
  console.log('─'.repeat(50));
  
  try {
    const stats = {
      users: await User.countDocuments(),
      circles: await TrustCircle.countDocuments(),
      loans: await Loan.countDocuments(),
      votes: await LoanVote.countDocuments(),
      contributions: await PoolContribution.countDocuments(),
      notifications: await Notification.countDocuments(),
    };

    console.log(`Users: ${stats.users}`);
    console.log(`Circles: ${stats.circles}`);
    console.log(`Loans: ${stats.loans}`);
    console.log(`Votes: ${stats.votes}`);
    console.log(`Contributions: ${stats.contributions}`);
    console.log(`Notifications: ${stats.notifications}`);

    // Loan status breakdown
    const loansByStatus = await Loan.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    console.log('\nLoan Status Breakdown:');
    loansByStatus.forEach((item) => {
      console.log(`  ${item._id}: ${item.count}`);
    });
  } catch (error) {
    console.error('❌ Statistics failed:', error);
  }
}

async function main() {
  console.log('🚀 Phase 2 Feature Testing\n');
  console.log('Testing all Priority 2 Extra Features...\n');

  await connectDB();

  await testNotifications();
  await testPoolContribution();
  await testVotingSystem();
  await testAnalytics();
  await testTrustScoreLogic();
  await showStatistics();

  console.log('\n✅ All tests completed!\n');
  
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
}

main().catch((error) => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
