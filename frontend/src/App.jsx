import React, { useEffect, useState } from "react";
import "./App.css";
import CartPage from "./pages/CartPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MenuPage from "./pages/MenuPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import { fetchAuthSuccess } from "./services/api";

const USER_STORAGE_KEY = "retail-user";

function App() {
  const [page, setPage] = useState("login");
  const [cart, setCart] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [booting, setBooting] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setBooting(false);
      return;
    }

    fetchAuthSuccess()
      .then((response) => {
        const authenticatedUser = response.data;
        setUser(authenticatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
        setPage("menu");
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
        setPage("login");
      })
      .finally(() => setBooting(false));
  }, []);

  const persistSession = (authResponse) => {
    localStorage.setItem("token", authResponse.token);
    const nextUser = {
      userId: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setPage("menu");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setCart([]);
    setLastOrder(null);
    setPage("login");
  };

  const handleAddToCart = (item, delta = 1) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.item.id === item.id);
      if (!existing) {
        return delta > 0 ? [...current, { item, quantity: delta }] : current;
      }

      const quantity = existing.quantity + delta;
      if (quantity <= 0) {
        return current.filter((entry) => entry.item.id !== item.id);
      }

      return current.map((entry) =>
        entry.item.id === item.id ? { ...entry, quantity } : entry
      );
    });
  };

  const handleOrderPlaced = (order) => {
    setLastOrder(order);
    setCart([]);
    setPage("success");
  };

  if (booting) {
    return <div className="screen-shell centered-panel">Checking your session...</div>;
  }

  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">HCL Hackathon Sprint 0</p>
          <h1>Retail Ordering System</h1>
        </div>
        {user && (
          <div className="topbar-actions">
            <div className="user-chip">
              <span>{user.name}</span>
              <strong>{user.role}</strong>
            </div>
            <button
              type="button"
              className={`nav-link ${page === "menu" ? "active" : ""}`}
              onClick={() => setPage("menu")}
            >
              Menu
            </button>
            <button
              type="button"
              className={`nav-link ${page === "cart" ? "active" : ""}`}
              onClick={() => setPage("cart")}
            >
              Cart ({cartCount})
            </button>
            <button
              type="button"
              className={`nav-link ${page === "success" ? "active" : ""}`}
              onClick={() => setPage("success")}
            >
              Orders
            </button>
            <button type="button" className="ghost-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="screen-shell">
        {!user && page === "login" && (
          <LoginPage
            onLoginSuccess={persistSession}
            onSwitchToRegister={() => setPage("register")}
          />
        )}

        {!user && page === "register" && (
          <RegisterPage
            onRegisterSuccess={persistSession}
            onSwitchToLogin={() => setPage("login")}
          />
        )}

        {user && page === "menu" && (
          <MenuPage user={user} cart={cart} onAddToCart={handleAddToCart} />
        )}

        {user && page === "cart" && (
          <CartPage
            user={user}
            cart={cart}
            onUpdateQty={handleAddToCart}
            onOrderPlaced={handleOrderPlaced}
          />
        )}

        {user && page === "success" && <SuccessPage lastOrder={lastOrder} />}
      </main>
    </div>
  );
}

export default App;
