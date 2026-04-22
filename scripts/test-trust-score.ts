/**
 * Trust Score System Test Script
 * Tests the ML model and encryption functionality
 */

import { trainModel, predictTrustScore, extractFeatures } from '../lib/ml-model.js';
import { generateKeyPair, encryptBehavioralData, decryptBehavioralData } from '../lib/encryption.js';
import type { BehavioralData } from '../lib/encryption.js';

console.log('🧪 Testing Trust Score System\n');

// Test 1: ML Model Training and Prediction
console.log('1️⃣ Testing ML Model...');
trainModel();

const testCases: BehavioralData[] = [
  {
    monthlyIncome: 25000,
    avgTransactionAmount: 5000,
    repaymentRate: 95,
    latePayments: 0,
    accountAgeMonths: 24,
    totalTransactions: 80,
  },
  {
    monthlyIncome: 8000,
    avgTransactionAmount: 2000,
    repaymentRate: 60,
    latePayments: 5,
    accountAgeMonths: 6,
    totalTransactions: 20,
  },
  {
    monthlyIncome: 15000,
    avgTransactionAmount: 3500,
    repaymentRate: 85,
    latePayments: 2,
    accountAgeMonths: 12,
    totalTransactions: 45,
  },
];

console.log('\nTest Cases:');
testCases.forEach((data, index) => {
  const features = extractFeatures(data);
  const score = predictTrustScore(features);
  console.log(`\nCase ${index + 1}:`);
  console.log(`  Income: ₹${data.monthlyIncome}`);
  console.log(`  Repayment Rate: ${data.repaymentRate}%`);
  console.log(`  Late Payments: ${data.latePayments}`);
  console.log(`  Account Age: ${data.accountAgeMonths} months`);
  console.log(`  → Trust Score: ${score}/100`);
});

// Test 2: Post-Quantum Encryption
console.log('\n\n2️⃣ Testing Post-Quantum Encryption...');

const keyPair = generateKeyPair();
console.log('✅ Keypair generated');
console.log(`  Public Key Length: ${keyPair.publicKey.length} chars`);
console.log(`  Private Key Length: ${keyPair.privateKey.length} chars`);

const testData: BehavioralData = {
  monthlyIncome: 20000,
  avgTransactionAmount: 4000,
  repaymentRate: 88,
  latePayments: 1,
  accountAgeMonths: 18,
  totalTransactions: 60,
};

console.log('\n📦 Original Data:');
console.log(JSON.stringify(testData, null, 2));

const encrypted = encryptBehavioralData(testData, keyPair.publicKey);
console.log('\n🔒 Encrypted Data:');
console.log(`  Length: ${encrypted.length} chars`);
console.log(`  Preview: ${encrypted.substring(0, 50)}...`);

const decrypted = decryptBehavioralData(encrypted, keyPair.privateKey);
console.log('\n🔓 Decrypted Data:');
console.log(JSON.stringify(decrypted, null, 2));

const isMatch = JSON.stringify(testData) === JSON.stringify(decrypted);
console.log(`\n✅ Encryption/Decryption: ${isMatch ? 'PASSED' : 'FAILED'}`);

// Test 3: Score Bounds
console.log('\n\n3️⃣ Testing Score Bounds...');

const extremeCases = [
  {
    name: 'Perfect Profile',
    data: {
      monthlyIncome: 100000,
      avgTransactionAmount: 20000,
      repaymentRate: 100,
      latePayments: 0,
      accountAgeMonths: 60,
      totalTransactions: 200,
    },
  },
  {
    name: 'Poor Profile',
    data: {
      monthlyIncome: 5000,
      avgTransactionAmount: 500,
      repaymentRate: 40,
      latePayments: 10,
      accountAgeMonths: 2,
      totalTransactions: 5,
    },
  },
];

extremeCases.forEach(({ name, data }) => {
  const features = extractFeatures(data);
  const score = predictTrustScore(features);
  console.log(`\n${name}:`);
  console.log(`  Score: ${score}/100`);
  console.log(`  Within bounds (35-98): ${score >= 35 && score <= 98 ? '✅' : '❌'}`);
});

console.log('\n\n✅ All tests completed!\n');
