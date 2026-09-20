import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, formatCents, type Order, type Payment } from "@ontime/web-shared";
import { useCartStore, cartTotalCents } from "../store/cartStore";
import { useRestaurant } from "../hooks/useRestaurants";
import { useCreateOrder } from "../hooks/useOrders";
import { useCreatePaymentIntent } from "../hooks/usePayments";
import { PaymentPanel } from "../components/PaymentPanel";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { restaurantId, lines, fulfillmentType, setQuantity, setFulfillmentType, clear } = useCartStore();
  const { data } = useRestaurant(restaurantId ?? undefined);
  const [note, setNote] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);

  const createOrder = useCreateOrder();
  const createPaymentIntent = useCreatePaymentIntent();

  useEffect(() => {
    if (order && !payment && !createPaymentIntent.isPending) {
      createPaymentIntent.mutate(order.id, {
        onSuccess: (res) => setPayment(res.payment),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (lines.length === 0 && !order) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse restaurants and add something to order ahead."
        action={
          <Button variant="secondary" onClick={() => navigate("/")}>
            Find a restaurant
          </Button>
        }
      />
    );
  }

  const total = cartTotalCents(lines);

  function placeOrder() {
    if (!restaurantId) return;
    createOrder.mutate(
      {
        restaurantId,
        fulfillmentType,
        items: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
        note: note || undefined,
      },
      { onSuccess: (res) => setOrder(res.order) },
    );
  }

  function handlePaymentSuccess() {
    clear();
    if (order) navigate(`/orders/${order.id}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-black text-white">Checkout</h1>
      {data && <p className="text-white/60">{data.restaurant.name}</p>}

      {!order && (
        <>
          <Card className="divide-y divide-white/10">
            {lines.map((line) => (
              <div key={line.menuItemId} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{line.name}</p>
                  <p className="font-mono-accent text-xs text-white/60">{formatCents(line.priceCents)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease ${line.name}`}
                    onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                    className="rounded p-1.5 text-white/70 hover:bg-white/10"
                  >
                    {line.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-white">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${line.name}`}
                    onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                    className="rounded p-1.5 text-white/70 hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between p-4">
              <span className="text-sm font-semibold text-white/70">Total</span>
              <span className="font-mono-accent text-lg font-bold text-white">{formatCents(total)}</span>
            </div>
          </Card>

          <div>
            <span className="mb-2 block text-sm font-medium text-white/80">Fulfillment</span>
            <div className="flex gap-2">
              {(["pickup", "dine-in"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFulfillmentType(option)}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                    fulfillmentType === option
                      ? "border-[#e3572c] bg-[#e3572c]/10 text-white"
                      : "border-white/15 text-white/60 hover:text-white"
                  }`}
                >
                  {option === "dine-in" ? "Dine-in" : "Pickup"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="note" className="mb-1 block text-sm font-medium text-white/80">
              Note for the kitchen (optional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#e3572c]"
              placeholder="Allergies, extra sauce, etc."
            />
          </div>

          {createOrder.isError && <p className="text-sm text-red-400">Couldn't place your order. Please try again.</p>}

          <Button className="w-full" loading={createOrder.isPending} onClick={placeOrder}>
            Place order — {formatCents(total)}
          </Button>
        </>
      )}

      {order && !payment && (
        <div className="flex justify-center py-10 text-white/60">Preparing payment…</div>
      )}

      {order && payment && <PaymentPanel payment={payment} onSuccess={handlePaymentSuccess} />}
    </div>
  );
}
