/**
 * Post-Quantum Encryption using Kyber (ML-KEM)
 * NIST-approved lattice-based cryptography
 */

import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';

export interface BehavioralData {
  monthlyIncome: number;
  avgTransactionAmount: number;
  repaymentRate: number; // percentage (0-100)
  latePayments: number;
  accountAgeMonths: number;
  totalTransactions: number;
}

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  sharedSecret: string; // Base64 encoded (used as encryption key)
}

export interface KeyPair {
  publicKey: string; // Base64 encoded
  privateKey: string; // Base64 encoded
}

/**
 * Generate a new Kyber key pair
 */
export function generateKeyPair(): KeyPair {
  const seed = crypto.getRandomValues(new Uint8Array(64));
  const { publicKey, secretKey } = ml_kem768.keygen(seed);
  
  return {
    publicKey: Buffer.from(publicKey).toString('base64'),
    privateKey: Buffer.from(secretKey).toString('base64'),
  };
}

/**
 * Encrypt data using Kyber public key
 * Returns ciphertext and shared secret
 */
export function encryptData(data: string, publicKeyBase64: string): EncryptedData {
  const publicKey = Buffer.from(publicKeyBase64, 'base64');
  
  // Encapsulate to get shared secret and ciphertext
  const { cipherText, sharedSecret } = ml_kem768.encapsulate(publicKey);
  
  // Use shared secret to XOR encrypt the actual data
  const dataBytes = new TextEncoder().encode(data);
  const encryptedBytes = new Uint8Array(dataBytes.length);
  
  for (let i = 0; i < dataBytes.length; i++) {
    encryptedBytes[i] = dataBytes[i] ^ sharedSecret[i % sharedSecret.length];
  }
  
  return {
    ciphertext: Buffer.from(cipherText).toString('base64') + '::' + Buffer.from(encryptedBytes).toString('base64'),
    sharedSecret: Buffer.from(sharedSecret).toString('base64'),
  };
}

/**
 * Decrypt data using Kyber private key
 */
export function decryptData(encryptedData: EncryptedData, privateKeyBase64: string): string {
  const privateKey = Buffer.from(privateKeyBase64, 'base64');
  
  // Split ciphertext
  const [cipherTextPart, encryptedDataPart] = encryptedData.ciphertext.split('::');
  const cipherText = Buffer.from(cipherTextPart, 'base64');
  
  // Decapsulate to recover shared secret
  const sharedSecret = ml_kem768.decapsulate(cipherText, privateKey);
  
  // XOR decrypt the data
  const encryptedBytes = Buffer.from(encryptedDataPart, 'base64');
  const decryptedBytes = new Uint8Array(encryptedBytes.length);
  
  for (let i = 0; i < encryptedBytes.length; i++) {
    decryptedBytes[i] = encryptedBytes[i] ^ sharedSecret[i % sharedSecret.length];
  }
  
  return new TextDecoder().decode(decryptedBytes);
}

/**
 * Client-side encryption helper
 * Use this in browser to encrypt sensitive behavioral data
 */
export function encryptBehavioralData(data: Record<string, any>, publicKey: string): string {
  const jsonData = JSON.stringify(data);
  const encrypted = encryptData(jsonData, publicKey);
  return JSON.stringify(encrypted);
}

/**
 * Server-side decryption helper
 * Use this in API routes to decrypt and process data
 */
export function decryptBehavioralData(encryptedJson: string, privateKey: string): Record<string, any> {
  const encrypted: EncryptedData = JSON.parse(encryptedJson);
  const decrypted = decryptData(encrypted, privateKey);
  return JSON.parse(decrypted);
}
