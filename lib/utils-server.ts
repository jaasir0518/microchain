/**
 * Server-side utility functions
 */

/**
 * Generate a unique 8-character invite code
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate loan due date (default 30 days)
 */
export function calculateDueDate(days: number = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Calculate repayment amount with interest
 */
export function calculateRepaymentAmount(principal: number, interestRate: number = 2): number {
  return Math.round(principal * (1 + interestRate / 100));
}
