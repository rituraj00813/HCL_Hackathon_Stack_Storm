import React, { useMemo, useState } from "react";
import { placeOrder } from "../services/api";

const initialPaymentDetails = {
  payerName: "",
  upiId: "",
  cardHolderName: "",
  cardLastFourDigits: "",
  transactionReference: "",
  deliveryAddress: "",
  phoneNumber: "",
};

const buildPaymentSummary = (paymentMethod, paymentStatus, paymentDetails) => {
  if (paymentMethod === "ONLINE") {
    if (paymentDetails.upiId.trim()) {
      return `ONLINE / ${paymentStatus} / UPI / ${paymentDetails.payerName.trim()} / ${paymentDetails.upiId.trim()} / REF ${paymentDetails.transactionReference.trim()}`;
    }

    return `ONLINE / ${paymentStatus} / CARD / ${paymentDetails.payerName.trim()} / ${paymentDetails.cardHolderName.trim()} / ****${paymentDetails.cardLastFourDigits.trim()} / REF ${paymentDetails.transactionReference.trim()}`;
  }

  return `CASH_ON_DELIVERY / ${paymentStatus} / ${paymentDetails.deliveryAddress.trim()} / ${paymentDetails.phoneNumber.trim()}`;
};

function CartPage({ user, cart, onUpdateQty, onOrderPlaced }) {
  const [customerName, setCustomerName] = useState(user.name);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [paymentDetails, setPaymentDetails] = useState({
    ...initialPaymentDetails,
    payerName: user.name,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0),
    [cart]
  );

  const paymentStatus = paymentMethod === "ONLINE" ? "PAID" : "PENDING";

  const handlePaymentFieldChange = (field, value) => {
    setPaymentDetails((current) => ({ ...current, [field]: value }));
  };

  const validateCheckout = () => {
    if (!cart.length) {
      return "Add at least one item before placing an order.";
    }

    if (!customerName.trim()) {
      return "Customer name is required.";
    }

    if (paymentMethod === "ONLINE") {
      if (!paymentDetails.payerName.trim()) {
        return "Payer name is required for online payment.";
      }
      if (!paymentDetails.transactionReference.trim()) {
        return "Transaction reference is required for online payment.";
      }

      const hasUpi = paymentDetails.upiId.trim();
      const hasCard =
        paymentDetails.cardHolderName.trim() &&
        paymentDetails.cardLastFourDigits.trim();

      if (!hasUpi && !hasCard) {
        return "Enter either a UPI ID or card details for online payment.";
      }

      if (
        paymentDetails.cardLastFourDigits.trim() &&
        !/^\d{4}$/.test(paymentDetails.cardLastFourDigits.trim())
      ) {
        return "Card last four digits must be exactly 4 numbers.";
      }
    }

    if (paymentMethod === "CASH_ON_DELIVERY") {
      if (!paymentDetails.deliveryAddress.trim()) {
        return "Delivery address is required for cash on delivery.";
      }
      if (!paymentDetails.phoneNumber.trim()) {
        return "Phone number is required for cash on delivery.";
      }
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationMessage = validateCheckout();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const paymentSummary = buildPaymentSummary(
        paymentMethod,
        paymentStatus,
        paymentDetails
      );

      const response = await placeOrder({
        customerName: customerName.trim(),
        paymentMethod,
        paymentStatus,
        paymentDetails,
        items: cart.map((entry) => ({
          itemId: entry.item.id,
          quantity: entry.quantity,
        })),
      });
      onOrderPlaced({
        ...response.data,
        paymentMethod: response.data.paymentMethod || paymentMethod,
        paymentStatus: response.data.paymentStatus || paymentStatus,
        paymentSummary: response.data.paymentSummary || paymentSummary,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to place the order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (user.role === "ADMIN") {
    return (
      <div className="centered-panel">
        Admin users can manage items from the menu page. Ordering flow is enabled for
        normal users.
      </div>
    );
  }

  return (
    <section className="stack-lg">
      <div className="section-card">
        <p className="eyebrow">Checkout</p>
        <h2>Review cart, complete payment, and place the order.</h2>
      </div>

      <div className="checkout-grid">
        <div className="section-card">
          <label className="field">
            <span>Customer name</span>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Customer name"
            />
          </label>

          {!cart.length ? (
            <p className="muted-text">Your cart is empty. Add items from the menu first.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((entry) => (
                    <tr key={entry.item.id}>
                      <td>{entry.item.name}</td>
                      <td>Rs. {entry.item.price.toFixed(2)}</td>
                      <td>
                        <div className="inline-actions">
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => onUpdateQty(entry.item, -1)}
                          >
                            -
                          </button>
                          <span className="qty-pill">{entry.quantity}</span>
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => onUpdateQty(entry.item, 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>Rs. {(entry.item.price * entry.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="section-card payment-card">
          <p className="eyebrow">Payment</p>
          <div className="payment-methods">
            <button
              type="button"
              className={`filter-chip ${paymentMethod === "ONLINE" ? "active" : ""}`}
              onClick={() => setPaymentMethod("ONLINE")}
            >
              Online
            </button>
            <button
              type="button"
              className={`filter-chip ${
                paymentMethod === "CASH_ON_DELIVERY" ? "active" : ""
              }`}
              onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
            >
              Cash on Delivery
            </button>
          </div>

          <div className="payment-status-box">
            <span>Payment status</span>
            <strong>{paymentStatus}</strong>
          </div>

          {paymentMethod === "ONLINE" ? (
            <div className="stack-md">
              <label className="field">
                <span>Payer name</span>
                <input
                  value={paymentDetails.payerName}
                  onChange={(event) =>
                    handlePaymentFieldChange("payerName", event.target.value)
                  }
                  placeholder="Payer name"
                />
              </label>
              <label className="field">
                <span>UPI ID</span>
                <input
                  value={paymentDetails.upiId}
                  onChange={(event) =>
                    handlePaymentFieldChange("upiId", event.target.value)
                  }
                  placeholder="example@upi"
                />
              </label>
              <p className="muted-text tiny-text">Or enter card details below.</p>
              <label className="field">
                <span>Card holder name</span>
                <input
                  value={paymentDetails.cardHolderName}
                  onChange={(event) =>
                    handlePaymentFieldChange("cardHolderName", event.target.value)
                  }
                  placeholder="Card holder name"
                />
              </label>
              <label className="field">
                <span>Card last 4 digits</span>
                <input
                  value={paymentDetails.cardLastFourDigits}
                  onChange={(event) =>
                    handlePaymentFieldChange(
                      "cardLastFourDigits",
                      event.target.value.replace(/\D/g, "").slice(0, 4)
                    )
                  }
                  placeholder="1234"
                />
              </label>
              <label className="field">
                <span>Transaction reference</span>
                <input
                  value={paymentDetails.transactionReference}
                  onChange={(event) =>
                    handlePaymentFieldChange(
                      "transactionReference",
                      event.target.value
                    )
                  }
                  placeholder="TXN123456"
                />
              </label>
            </div>
          ) : (
            <div className="stack-md">
              <label className="field">
                <span>Delivery address</span>
                <input
                  value={paymentDetails.deliveryAddress}
                  onChange={(event) =>
                    handlePaymentFieldChange("deliveryAddress", event.target.value)
                  }
                  placeholder="Full delivery address"
                />
              </label>
              <label className="field">
                <span>Phone number</span>
                <input
                  value={paymentDetails.phoneNumber}
                  onChange={(event) =>
                    handlePaymentFieldChange("phoneNumber", event.target.value)
                  }
                  placeholder="Phone number"
                />
              </label>
            </div>
          )}

          <div className="summary-row">
            <span>Total amount</span>
            <strong>Rs. {total.toFixed(2)}</strong>
          </div>

          {error && <p className="error-banner">{error}</p>}

          <button
            type="button"
            className="primary-btn wide-btn"
            onClick={handleSubmit}
            disabled={submitting || !cart.length}
          >
            {submitting
              ? "Completing payment..."
              : "Complete Payment and Place Order"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
