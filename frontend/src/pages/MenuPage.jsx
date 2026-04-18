import React, { useEffect, useMemo, useState } from "react";
import {
  adminAddItem,
  adminDeleteItem,
  fetchAllItems,
  fetchItemsByCategory,
} from "../services/api";

const CATEGORIES = ["ALL", "PIZZA", "DRINK", "BREAD"];

const emptyItemForm = {
  name: "",
  category: "PIZZA",
  price: "",
  stock: "",
};

function MenuPage({ user, cart, onAddToCart }) {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminForm, setAdminForm] = useState(emptyItemForm);
  const [adminMessage, setAdminMessage] = useState("");

  const loadItems = (selectedCategory = category) => {
    setLoading(true);
    setError("");

    const request =
      selectedCategory === "ALL" ? fetchAllItems() : (
        fetchItemsByCategory(selectedCategory)
      );

    request
      .then((response) => setItems(response.data))
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message || "Unable to load menu items.",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems(category);
  }, [category]);

  const cartById = useMemo(() => {
    return cart.reduce((accumulator, entry) => {
      accumulator[entry.item.id] = entry.quantity;
      return accumulator;
    }, {});
  }, [cart]);

  const totalCartItems = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    setAdminMessage("");
    setError("");

    try {
      await adminAddItem({
        ...adminForm,
        price: Number(adminForm.price),
        stock: Number(adminForm.stock),
      });
      setAdminForm(emptyItemForm);
      setAdminMessage("Item added successfully.");
      loadItems(category);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to add the item.",
      );
    }
  };

  const handleDelete = async (id) => {
    setAdminMessage("");
    setError("");

    try {
      await adminDeleteItem(id);
      setAdminMessage(`Item ${id} deleted successfully.`);
      loadItems(category);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to delete the item.",
      );
    }
  };

  return (
    <section className="stack-lg">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Menu page</p>
          <h2>
            {user.role === "ADMIN" ?
              "Control the full catalog from one clean admin workspace."
            : "Explore the catalog, adjust quantities, and prepare your checkout."
            }
          </h2>
          <p className="muted-text">
            {user.role === "ADMIN" ?
              "Use this page to add new menu entries, track stock levels, and remove unavailable products."
            : "Filter by category, add items instantly, and keep your cart updated in real time."
            }
          </p>
          <div className="hero-actions">
            <div className="page-badge">
              <span>Selected category</span>
              <strong>{category}</strong>
            </div>
            <div className="page-badge">
              <span>
                {user.role === "ADMIN" ? "Catalog size" : "Cart items"}
              </span>
              <strong>
                {user.role === "ADMIN" ? items.length : totalCartItems}
              </strong>
            </div>
          </div>
        </div>

        <div className="hero-meta">
          <div className="hero-meta-card">
            <span>Logged in as</span>
            <strong>{user.name}</strong>
            <p>{user.email}</p>
          </div>
          <div className="hero-meta-card">
            <span>Role</span>
            <strong>{user.role}</strong>
            <p>
              {user.role === "ADMIN" ?
                "Menu management enabled"
              : "Ordering enabled"}
            </p>
          </div>
        </div>
      </div>

      {user.role === "USER" && (
        <section className="section-grid-3">
          <article className="metric-card">
            <span>Visible items</span>
            <strong>{items.length}</strong>
          </article>
          <article className="metric-card">
            <span>Active filter</span>
            <strong>{category}</strong>
          </article>
          <article className="metric-card">
            <span>Ready for checkout</span>
            <strong>{totalCartItems}</strong>
          </article>
        </section>
      )}

      {user.role === "ADMIN" && (
        <section className="admin-panel">
          <div className="page-header">
            <div>
              <p className="eyebrow">Admin controls</p>
              <h3>Add or remove menu items</h3>
              <p className="muted-text">
                Create fresh menu entries with category, price, and stock so the
                frontend updates from the live API.
              </p>
            </div>
            <div className="page-badge">
              <span>Current items</span>
              <strong>{items.length}</strong>
            </div>
          </div>

          <form className="admin-form" onSubmit={handleAdminSubmit}>
            <input
              value={adminForm.name}
              onChange={(event) =>
                setAdminForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Item name"
              required
            />
            <select
              value={adminForm.category}
              onChange={(event) =>
                setAdminForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            >
              {CATEGORIES.filter((entry) => entry !== "ALL").map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              step="0.01"
              value={adminForm.price}
              onChange={(event) =>
                setAdminForm((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
              placeholder="Price"
              required
            />
            <input
              type="number"
              min="0"
              value={adminForm.stock}
              onChange={(event) =>
                setAdminForm((current) => ({
                  ...current,
                  stock: event.target.value,
                }))
              }
              placeholder="Stock"
              required
            />
            <button type="submit" className="primary-btn">
              Add Item
            </button>
          </form>

          {adminMessage && <p className="success-banner">{adminMessage}</p>}
        </section>
      )}

      <section className="section-card stack-md">
        <div className="page-header">
          <div>
            <p className="eyebrow">Category filter</p>
            <h3>Switch between pizza, drink, and bread items</h3>
          </div>
          <div className="page-badge">
            <span>Results</span>
            <strong>{items.length}</strong>
          </div>
        </div>

        <div className="filter-row">
          {CATEGORIES.map((entry) => (
            <button
              key={entry}
              type="button"
              className={`filter-chip ${category === entry ? "active" : ""}`}
              onClick={() => setCategory(entry)}
            >
              {entry}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}

      {loading ?
        <div className="centered-panel">Loading menu...</div>
      : <div className="item-grid">
          {items.map((item) => {
            const quantity = cartById[item.id] || 0;

            return (
              <article key={item.id} className="item-card">
                <div className="item-head">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.category}</p>
                  </div>
                  <strong>Rs. {item.price.toFixed(2)}</strong>
                </div>

                <p className={item.stock < 5 ? "stock-low" : "stock-ok"}>
                  Stock available: {item.stock}
                </p>

                <div className="item-foot">
                  <span className="muted-text">Item ID #{item.id}</span>

                  <div className="card-actions">
                    {user.role === "USER" && (
                      <>
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() => onAddToCart(item, -1)}
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span className="qty-pill">{quantity}</span>
                        <button
                          type="button"
                          className="primary-btn"
                          onClick={() => onAddToCart(item, 1)}
                          disabled={item.stock === 0 || quantity >= item.stock}
                        >
                          Add
                        </button>
                      </>
                    )}

                    {user.role === "ADMIN" && (
                      <button
                        type="button"
                        className="danger-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      }
    </section>
  );
}

export default MenuPage;
