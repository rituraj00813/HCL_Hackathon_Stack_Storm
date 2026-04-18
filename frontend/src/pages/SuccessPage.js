import React, { useEffect, useState } from "react";
import { fetchOrderById, fetchOrders, fetchOrderSuccess } from "../services/api";

const extractDisplayPaymentDetails = (order) => {
  const summary = order.paymentSummary || "";
  const summaryParts = summary.split("/").map((part) => part.trim());

  if (order.paymentMethod === "ONLINE" || summaryParts[0] === "ONLINE") {
    if (summaryParts[2] === "UPI" && summaryParts[4]) {
      return summaryParts[4];
    }
    if (summaryParts[2] === "CARD" && summaryParts[5]) {
      return `Card ending ${summaryParts[5].replace("*", "")}`;
    }
    return "Online payment completed";
  }

  if (
    order.paymentMethod === "CASH_ON_DELIVERY" ||
    summaryParts[0] === "CASH_ON_DELIVERY"
  ) {
    return summaryParts[2] || "Cash on delivery";
  }

  return "Legacy order";
};

const extractDisplayPaymentMethod = (order) => {
  const summary = order.paymentSummary || "";
  const summaryParts = summary.split("/").map((part) => part.trim());

  if (order.paymentMethod === "ONLINE" || summaryParts[0] === "ONLINE") {
    return "ONLINE";
  }

  if (
    order.paymentMethod === "CASH_ON_DELIVERY" ||
    summaryParts[0] === "CASH_ON_DELIVERY"
  ) {
    return "CASH ON DELIVERY";
  }

  return "N/A";
};

const normalizeOrder = (order) => {
  if (!order) {
    return order;
  }

  const paymentMethod = order.paymentMethod || "LEGACY_ORDER";
  const paymentStatus = order.paymentStatus || "NOT_AVAILABLE";
  const paymentSummary =
    order.paymentSummary ||
    (paymentMethod === "LEGACY_ORDER"
      ? "Payment details were not stored for this older order. Place a fresh order to see full payment info."
      : `${paymentMethod} / ${paymentStatus}`);

  return {
    ...order,
    paymentMethod,
    paymentStatus,
    paymentSummary,
    displayPaymentMethod: extractDisplayPaymentMethod({
      ...order,
      paymentMethod,
      paymentStatus,
      paymentSummary,
    }),
    displayPaymentDetails: extractDisplayPaymentDetails({
      ...order,
      paymentMethod,
      paymentStatus,
      paymentSummary,
    }),
  };
};

function SuccessPage({ lastOrder }) {
  const [lookupId, setLookupId] = useState("");
  const [history, setHistory] = useState(lastOrder ? [normalizeOrder(lastOrder)] : []);
  const [highlightOrder, setHighlightOrder] = useState(
    lastOrder ? normalizeOrder(lastOrder) : null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (lastOrder) {
      const normalizedLastOrder = normalizeOrder(lastOrder);
      setHistory((current) => {
        const alreadyPresent = current.some(
          (order) => order.orderId === normalizedLastOrder.orderId
        );
        return alreadyPresent ? current : [normalizedLastOrder, ...current];
      });
    }

    fetchOrders()
      .then((response) => setHistory(response.data.map(normalizeOrder)))
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message || "Unable to load order history."
        );
      });
  }, [lastOrder]);

  useEffect(() => {
    if (lastOrder) {
      setHighlightOrder(normalizeOrder(lastOrder));
      return;
    }

    fetchOrderSuccess()
      .then((response) => setHighlightOrder(normalizeOrder(response.data.order)))
      .catch(() => {});
  }, [lastOrder]);

  const handleLookup = async () => {
    setError("");
    const normalizedId = lookupId.trim();

    if (!normalizedId) {
      setError("Please enter an order ID.");
      return;
    }

    if (!/^\d+$/.test(normalizedId)) {
      setError("Order ID must be a number.");
      return;
    }

    try {
      const response = await fetchOrderById(normalizedId);
      setHighlightOrder(normalizeOrder(response.data));
      setLookupId("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Order lookup failed.");
    }
  };

  return (
    <section className="stack-lg">
      <div className="section-card">
        <p className="eyebrow">Success page</p>
        <h2>Order status and lookup</h2>
        <p className="muted-text">
          This page reflects the Sprint 0 `GET /auth/success` and `GET /orders/success`
          style flow after login and order placement.
        </p>
      </div>

      {highlightOrder && (
        <div className="section-card">
          <p className="eyebrow">Latest order</p>
          <h3>Order #{highlightOrder.orderId}</h3>
          <div className="summary-row">
            <span>Customer</span>
            <strong>{highlightOrder.customerName}</strong>
          </div>
          <div className="summary-row">
            <span>Status</span>
            <strong>{highlightOrder.status}</strong>
          </div>
          <div className="summary-row">
            <span>Payment</span>
            <strong>{highlightOrder.displayPaymentMethod}</strong>
          </div>
          <div className="summary-row">
            <span>Payment details</span>
            <strong>{highlightOrder.displayPaymentDetails}</strong>
          </div>
          <div className="summary-row">
            <span>Total</span>
            <strong>Rs. {highlightOrder.totalAmount.toFixed(2)}</strong>
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="lookup-row">
          <input
            value={lookupId}
            onChange={(event) => setLookupId(event.target.value)}
            placeholder="Enter order id"
          />
          <button type="button" className="primary-btn" onClick={handleLookup}>
            Find Order
          </button>
        </div>
        {error && <p className="error-banner">{error}</p>}
      </div>

      <div className="section-card">
        <p className="eyebrow">Order history</p>
        <div className="table-wrap">
          {history.length === 0 ? (
            <p className="muted-text">No orders found yet for this user.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {history.map((order) => (
                  <tr
                    key={order.orderId}
                    onClick={() => setHighlightOrder(order)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>#{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td>{order.displayPaymentMethod}</td>
                    <td>{order.status}</td>
                    <td>Rs. {order.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}

export default SuccessPage;
