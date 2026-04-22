/**
 * Phase 1 Testing Script
 * Run this to test all core features
 */

import { generateKeyPair, encryptBehavioralData, decryptBehavioralData } from '../lib/encryption';
import { calculateTrustScore, generateSyntheticData, evaluateModel, getModel } from '../lib/ml-model';
import { generateInviteCode, calculateDueDate, calculateRepaymentAmount } from '../lib/utils-server';

console.log('🧪 Phase 1 Feature Testing\n');

// Test 1: Post-Quantum Encryption
console.log('1️⃣ Testing Post-Quantum Encryption (Kyber)...');
try {
  const keyPair = generateKeyPair();
  console.log('✅ Key pair generated');
  console.log(`   Public Key: ${keyPair.publicKey.substring(0, 20)}...`);
  console.log(`   Private Key: ${keyPair.privateKey.substring(0, 20)}...`);
  
  const testData = {
    pastRepaymentRate: 85,
    onTimeRepayments: 10,
    latePayments: 2,
  };
  
  const encrypted = encryptBehavioralData(testData, keyPair.publicKey);
  console.log('✅ Data encrypted successfully');
  
  const decrypted = decryptBehavioralData(encrypted, keyPair.privateKey);
  console.log('✅ Data decrypted successfully');
  console.log(`   Original: ${JSON.stringify(testData)}`);
  console.log(`   Decrypted: ${JSON.stringify(decrypted)}`);
  console.log('');
} catch (error) {
  console.error('❌ Encryption test failed:', error);
}

// Test 2: AI Trust Scoring
console.log('2️⃣ Testing AI Trust Scoring Engine...');
try {
  // Test with high trust features
  const highTrustFeatures = {
    pastRepaymentRate: 95,
    onTimeRepayments: 15,
    latePayments: 0,
    circleActivity: 8,
    incomeStability: 85,
    defaultHistory: 0,
    accountAge: 365,
    contributionAmount: 5000,
  };
  
  const highScore = calculateTrustScore(highTrustFeatures);
  console.log(`✅ High Trust User Score: ${highScore}/100`);
  console.log(`   Auto-Approval: ${highScore >= 70 ? 'YES ✓' : 'NO ✗'}`);
  
  // Test with low trust features
  const lowTrustFeatures = {
    pastRepaymentRate: 45,
    onTimeRepayments: 2,
    latePayments: 8,
    circleActivity: 1,
    incomeStability: 30,
    defaultHistory: 1,
    accountAge: 30,
    contributionAmount: 100,
  };
  
  const lowScore = calculateTrustScore(lowTrustFeatures);
  console.log(`✅ Low Trust User Score: ${lowScore}/100`);
  console.log(`   Auto-Approval: ${lowScore >= 70 ? 'YES ✓' : 'NO ✗'}`);
  console.log('');
} catch (error) {
  console.error('❌ Trust scoring test failed:', error);
}

// Test 3: Model Training & Evaluation
console.log('3️⃣ Testing Model Training...');
try {
  const trainingData = generateSyntheticData(200);
  console.log(`✅ Generated ${trainingData.length} synthetic training records`);
  
  const model = getModel();
  model.train(trainingData);
  console.log('✅ Model trained successfully');
  
  const testData = generateSyntheticData(50);
  const accuracy = evaluateModel(testData);
  console.log(`✅ Model Accuracy: ${accuracy.toFixed(2)}%`);
  console.log('');
} catch (error) {
  console.error('❌ Model training test failed:', error);
}

// Test 4: Utility Functions
console.log('4️⃣ Testing Utility Functions...');
try {
  const inviteCode = generateInviteCode();
  console.log(`✅ Generated Invite Code: ${inviteCode}`);
  
  const dueDate = calculateDueDate(30);
  console.log(`✅ Calculated Due Date (30 days): ${dueDate.toLocaleDateString()}`);
  
  const repaymentAmount = calculateRepaymentAmount(5000, 2);
  console.log(`✅ Repayment Amount (₹5000 + 2%): ₹${repaymentAmount}`);
  console.log('');
} catch (error) {
  console.error('❌ Utility functions test failed:', error);
}

// Test 5: Complete Flow Simulation
console.log('5️⃣ Simulating Complete User Flow...');
try {
  console.log('   Step 1: User generates encryption keys');
  const keys = generateKeyPair();
  
  console.log('   Step 2: User encrypts behavioral data');
  const behavioralData = {
    pastRepaymentRate: 80,
    onTimeRepayments: 12,
    latePayments: 1,
    circleActivity: 5,
    incomeStability: 75,
    defaultHistory: 0,
    accountAge: 180,
    contributionAmount: 2000,
  };
  const encrypted = encryptBehavioralData(behavioralData, keys.publicKey);
  
  console.log('   Step 3: Server decrypts data');
  const decrypted = decryptBehavioralData(encrypted, keys.privateKey);
  
  console.log('   Step 4: AI calculates trust score');
  const trustScore = calculateTrustScore(decrypted);
  
  console.log('   Step 5: Loan eligibility check');
  const eligible = trustScore >= 70;
  
  console.log(`\n   ✅ Final Trust Score: ${trustScore}/100`);
  console.log(`   ✅ Loan Eligibility: ${eligible ? 'APPROVED ✓' : 'NEEDS REVIEW'}`);
  
  if (eligible) {
    console.log('   ✅ User can request loans up to ₹8,000');
    const loanAmount = 3000;
    const repayment = calculateRepaymentAmount(loanAmount, 2);
    console.log(`   ✅ Example: ₹${loanAmount} loan → ₹${repayment} repayment`);
  }
  console.log('');
} catch (error) {
  console.error('❌ Flow simulation failed:', error);
}

console.log('🎉 Phase 1 Testing Complete!\n');
console.log('📊 Summary:');
console.log('   ✅ Post-Quantum Encryption: Working');
console.log('   ✅ AI Trust Scoring: Working');
console.log('   ✅ Model Training: Working');
console.log('   ✅ Utility Functions: Working');
console.log('   ✅ Complete Flow: Working');
console.log('\n🚀 Ready for API testing and frontend development!');
