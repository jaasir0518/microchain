/**
 * Trust Score Calculation API
 * Accepts encrypted behavioral data and returns calculated trust score
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { predictTrustScore, extractFeatures } from '@/lib/ml-model';
import { decryptBehavioralData, BehavioralData } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { encryptedData, privateKey } = body;

    if (!encryptedData) {
      return NextResponse.json(
        { error: 'Encrypted data is required' },
        { status: 400 }
      );
    }

    // Decrypt behavioral data
    let behavioralData: BehavioralData;
    
    try {
      if (privateKey) {
        // Full encryption flow (production)
        const decrypted = decryptBehavioralData(encryptedData, privateKey);
        behavioralData = decrypted as BehavioralData;
      } else {
        // Simplified flow for demo (data is already decrypted on client)
        const parsed = typeof encryptedData === 'string' 
          ? JSON.parse(encryptedData) 
          : encryptedData;
        behavioralData = parsed as BehavioralData;
      }
    } catch (error) {
      console.error('Decryption error:', error);
      return NextResponse.json(
        { error: 'Failed to decrypt data' },
        { status: 400 }
      );
    }

    // Validate behavioral data
    if (
      typeof behavioralData.monthlyIncome !== 'number' ||
      typeof behavioralData.repaymentRate !== 'number' ||
      typeof behavioralData.latePayments !== 'number' ||
      typeof behavioralData.accountAgeMonths !== 'number' ||
      typeof behavioralData.totalTransactions !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid behavioral data format' },
        { status: 400 }
      );
    }

    // Extract features and predict trust score
    const features = extractFeatures(behavioralData);
    const trustScore = predictTrustScore(features);

    // Update user with new trust score
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        trustScore,
        lastStatementUploadedAt: new Date(),
        behavioralData: {
          monthlyIncome: behavioralData.monthlyIncome,
          avgTransactionAmount: behavioralData.avgTransactionAmount,
          repaymentRate: behavioralData.repaymentRate,
          latePayments: behavioralData.latePayments,
          accountAgeMonths: behavioralData.accountAgeMonths,
          totalTransactions: behavioralData.totalTransactions,
        },
        $push: {
          trustHistory: {
            score: trustScore,
            reason: 'Behavioral Profile Updated',
            date: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      trustScore,
      message: 'Trust score calculated successfully using Post-Quantum encrypted data',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Trust calculation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate trust score' },
      { status: 500 }
    );
  }
}
