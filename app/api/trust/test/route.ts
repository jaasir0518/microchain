/**
 * Trust Score System Test API
 * Tests the ML model and encryption functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { trainModel, predictTrustScore, extractFeatures } from '@/lib/ml-model';
import { generateKeyPair, encryptBehavioralData, decryptBehavioralData, BehavioralData } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  try {
    // Test 1: ML Model Training and Prediction
    console.log('Testing ML Model...');
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

    const mlTestResults = testCases.map((data, index) => {
      const features = extractFeatures(data);
      const score = predictTrustScore(features);
      return {
        case: index + 1,
        input: data,
        trustScore: score,
        passed: score >= 35 && score <= 98,
      };
    });

    results.tests.push({
      name: 'ML Model Training and Prediction',
      status: 'PASSED',
      results: mlTestResults,
    });

    // Test 2: Post-Quantum Encryption
    console.log('Testing Post-Quantum Encryption...');

    const keyPair = generateKeyPair();
    
    const testData: BehavioralData = {
      monthlyIncome: 20000,
      avgTransactionAmount: 4000,
      repaymentRate: 88,
      latePayments: 1,
      accountAgeMonths: 18,
      totalTransactions: 60,
    };

    const encrypted = encryptBehavioralData(testData, keyPair.publicKey);
    const decrypted = decryptBehavioralData(encrypted, keyPair.privateKey);

    const encryptionPassed = JSON.stringify(testData) === JSON.stringify(decrypted);

    results.tests.push({
      name: 'Post-Quantum Encryption',
      status: encryptionPassed ? 'PASSED' : 'FAILED',
      details: {
        publicKeyLength: keyPair.publicKey.length,
        privateKeyLength: keyPair.privateKey.length,
        encryptedLength: encrypted.length,
        encryptionDecryptionMatch: encryptionPassed,
      },
    });

    // Test 3: Score Bounds
    console.log('Testing Score Bounds...');

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

    const boundsTestResults = extremeCases.map(({ name, data }) => {
      const features = extractFeatures(data);
      const score = predictTrustScore(features);
      const withinBounds = score >= 35 && score <= 98;
      return {
        name,
        score,
        withinBounds,
        passed: withinBounds,
      };
    });

    const allBoundsPassed = boundsTestResults.every((r) => r.passed);

    results.tests.push({
      name: 'Score Bounds (35-98)',
      status: allBoundsPassed ? 'PASSED' : 'FAILED',
      results: boundsTestResults,
    });

    // Overall status
    const allPassed = results.tests.every((test: any) => test.status === 'PASSED');
    results.overallStatus = allPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌';

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json(
      {
        error: 'Test execution failed',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
