import { useState, type FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button, formatCents, type Payment } from "@ontime/web-shared";
import { getStripe } from "../lib/stripe";
import { useConfirmMockPayment } from "../hooks/usePayments";

function StripeCheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setSubmitting(false);
    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      return;
    }
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" loading={submitting} disabled={!stripe} className="w-full">
        Pay now
      </Button>
    </form>
  );
}

function MockCheckoutForm({ paymentId, onSuccess }: { paymentId: string; onSuccess: () => void }) {
  const confirmMock = useConfirmMockPayment();
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/70">
        No Stripe key is configured for this environment, so checkout uses a mock payment —
        this confirms the order the same way a real card payment would.
      </div>
      {confirmMock.isError && (
        <p className="text-sm text-red-400">Payment failed. Please try again.</p>
      )}
      <Button
        className="w-full"
        loading={confirmMock.isPending}
        onClick={() => confirmMock.mutate(paymentId, { onSuccess })}
      >
        Confirm mock payment
      </Button>
    </div>
  );
}

export function PaymentPanel({ payment, onSuccess }: { payment: Payment; onSuccess: () => void }) {
  const stripePromise = getStripe();

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-bold text-white">Payment</h3>
        <span className="font-mono-accent text-lg text-white">{formatCents(payment.amountCents)}</span>
      </div>

      {payment.provider === "stripe" && stripePromise && payment.clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{ clientSecret: payment.clientSecret, appearance: { theme: "night" } }}
        >
          <StripeCheckoutForm onSuccess={onSuccess} />
        </Elements>
      ) : (
        <MockCheckoutForm paymentId={payment.id} onSuccess={onSuccess} />
      )}
    </div>
  );
}
