/**
 * Keypair Generation API
 * Generates Post-Quantum cryptographic keypair for encryption
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateKeyPair } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate new keypair
    const keyPair = generateKeyPair();

    return NextResponse.json({
      success: true,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      message: 'Keypair generated successfully',
      note: 'Store private key securely - it will not be saved on server',
    });
  } catch (error: any) {
    console.error('Keypair generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate keypair' },
      { status: 500 }
    );
  }
}
