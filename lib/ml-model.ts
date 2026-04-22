/**
 * AI Trust Scoring Engine
 * Uses logistic regression to predict creditworthiness
 */

import { BehavioralData } from './encryption';

// Simple logistic regression implementation
class LogisticRegression {
  private weights: number[] = [];
  private bias: number = 0;
  private learningRate: number;
  private numSteps: number;

  constructor(options: { learningRate: number; numSteps: number }) {
    this.learningRate = options.learningRate;
    this.numSteps = options.numSteps;
  }

  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  train(X: number[][], y: number[]): void {
    const numFeatures = X[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    for (let step = 0; step < this.numSteps; step++) {
      const predictions = X.map((features) => this.predict(features));

      // Calculate gradients
      const weightGradients = new Array(numFeatures).fill(0);
      let biasGradient = 0;

      for (let i = 0; i < X.length; i++) {
        const error = predictions[i] - y[i];
        for (let j = 0; j < numFeatures; j++) {
          weightGradients[j] += error * X[i][j];
        }
        biasGradient += error;
      }

      // Update weights
      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= (this.learningRate * weightGradients[j]) / X.length;
      }
      this.bias -= (this.learningRate * biasGradient) / X.length;
    }
  }

  predict(features: number[]): number {
    let z = this.bias;
    for (let i = 0; i < features.length; i++) {
      z += this.weights[i] * features[i];
    }
    return this.sigmoid(z);
  }

  predictProbability(features: number[]): number {
    return this.predict(features);
  }
}

// Synthetic training data
// Format: [monthlyIncome/1000, repaymentRate, latePayments, accountAge, totalTx, trustScore(0/1)]
const syntheticTrainingData = [
  [15, 85, 2, 12, 45, 1],
  [8, 60, 5, 6, 20, 0],
  [25, 95, 0, 24, 80, 1],
  [12, 70, 3, 10, 35, 0],
  [30, 90, 1, 36, 100, 1],
  [5, 50, 8, 3, 15, 0],
  [20, 88, 1, 18, 60, 1],
  [10, 65, 4, 8, 25, 0],
  [18, 92, 0, 20, 70, 1],
  [7, 55, 6, 5, 18, 0],
  [22, 87, 2, 15, 55, 1],
  [9, 62, 5, 7, 22, 0],
  [28, 94, 0, 30, 90, 1],
  [6, 52, 7, 4, 16, 0],
  [16, 80, 2, 14, 50, 1],
  [11, 68, 4, 9, 28, 0],
  [24, 91, 1, 22, 75, 1],
  [8, 58, 6, 6, 19, 0],
  [19, 86, 1, 16, 58, 1],
  [10, 64, 5, 8, 24, 0],
];

let model: LogisticRegression | null = null;

/**
 * Train the trust scoring model
 */
export function trainModel(): void {
  const X = syntheticTrainingData.map((row) => row.slice(0, -1));
  const y = syntheticTrainingData.map((row) => row[row.length - 1]);

  model = new LogisticRegression({ numSteps: 1000, learningRate: 0.01 });
  model.train(X, y);

  console.log('✅ Trust Scoring Model Trained');
}

/**
 * Predict trust score from behavioral features
 */
export function predictTrustScore(features: number[]): number {
  if (!model) trainModel();

  const probability = model!.predictProbability(features);

  // Convert to 0-100 scale
  let score = Math.round(probability * 100);

  // Apply realistic bounds (20-95 range based on actual predictions)
  score = Math.min(95, Math.max(20, score));

  return score;
}

/**
 * Extract features from behavioral data
 */
export function extractFeatures(data: BehavioralData): number[] {
  return [
    data.monthlyIncome / 1000, // normalized
    data.repaymentRate,
    data.latePayments,
    data.accountAgeMonths,
    data.totalTransactions,
  ];
}
