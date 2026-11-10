'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { priceLabel } from '@/features/store/commerce.utils';
import { Link } from '@/lib/navigation';
import { apiRequest } from '@/services/api/client';
import type { ApiResult } from '@devsangam/types';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
type CheckoutOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (result: CheckoutResponse) => void;
  modal: { ondismiss: () => void };
};
type RazorpayConstructor = new (options: CheckoutOptions) => {
  open: () => void;
  on: (name: string, callback: () => void) => void;
};
declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}
let scriptPromise: Promise<void> | null = null;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    const timer = window.setTimeout(() => {
      script.remove();
      reject(new Error('Checkout timed out. Please retry.'));
    }, 15000);
    script.onload = () => {
      window.clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error('Checkout could not load.'));
    };
    document.head.append(script);
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });
  return scriptPromise;
}

export function PurchaseButton({
  itemId,
  itemType,
  pricePaise,
}: {
  itemId: string;
  itemType: 'mantra' | 'digital_product';
  pricePaise: number;
}) {
  const auth = useAuth();
  const query = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (!auth.isAuthenticated)
    return (
      <Link
        className="inline-block rounded-lg border border-border px-4 py-3"
        to="/auth/login"
      >
        Sign in to unlock
      </Link>
    );
  async function start() {
    setBusy(true);
    setMessage('');
    try {
      await loadCheckout();
      const { data } = await apiRequest<
        ApiResult<{
          orderId: string;
          razorpayOrderId: string;
          amountPaise: number;
          currency: string;
          keyId: string;
          title: string;
        }>
      >('/payments/orders', {
        method: 'POST',
        body: JSON.stringify({ itemType, itemId }),
      });
      if (!window.Razorpay) throw new Error('Checkout is unavailable.');
      const checkout = new window.Razorpay({
        key: data.keyId,
        order_id: data.razorpayOrderId,
        amount: data.amountPaise,
        currency: data.currency,
        name: 'DevSangam',
        description: data.title,
        handler: (result) => {
          void (async () => {
            try {
              const verified = await apiRequest<ApiResult<{ status: string }>>(
                '/payments/verify',
                {
                  method: 'POST',
                  body: JSON.stringify({ orderId: data.orderId, ...result }),
                }
              );
              setMessage(
                verified.data.status === 'paid'
                  ? 'Payment verified. Your access is ready.'
                  : 'Payment is awaiting confirmation. Check your order history.'
              );
              await query.invalidateQueries();
            } catch {
              setMessage(
                'Payment confirmation is pending. Use Check payment in order history before trying another purchase.'
              );
            } finally {
              setBusy(false);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setMessage(
              'Checkout closed. Check order history if you made a payment.'
            );
          },
        },
      });
      checkout.on('payment.failed', () => {
        setBusy(false);
        setMessage('Payment did not complete. You can retry from this page.');
      });
      checkout.open();
    } catch (error) {
      setBusy(false);
      setMessage(
        error instanceof Error ? error.message : 'Could not start payment.'
      );
    }
  }
  return (
    <div>
      <Button disabled={busy} onClick={() => void start()}>
        {busy ? 'Confirming…' : `Unlock · ${priceLabel(pricePaise)}`}
      </Button>
      <p role="status" className="mt-3 leading-6">
        {message}
      </p>
      <Link
        className="mt-2 inline-block underline"
        to="/digital-library/purchases"
      >
        Order history
      </Link>
    </div>
  );
}
