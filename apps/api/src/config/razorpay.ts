import { AppError } from '../utils/app-error.ts';

export function paymentConfig() {
  if (
    process.env.PAYMENTS_ENABLED !== 'true' ||
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    throw new AppError(
      503,
      'PAYMENTS_UNAVAILABLE',
      'Payments are not available yet. Please try again later.'
    );
  }
  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    secret: process.env.RAZORPAY_KEY_SECRET,
  };
}
export async function razorpayRequest(
  path: string,
  body?: unknown
): Promise<unknown> {
  const { keyId, secret } = paymentConfig();
  try {
    const response = await fetch(`https://api.razorpay.com/v1${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Provider request failed');
    return await response.json();
  } catch {
    throw new AppError(
      503,
      'PAYMENT_PROVIDER_UNAVAILABLE',
      'Payment service is temporarily unavailable.'
    );
  }
}
