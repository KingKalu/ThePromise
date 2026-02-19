import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { getBranches, getMenu, createOrder, getOrders } from "@/lib/api";

const steps = ["Menu", "Payment", "Status"];

const BRANCH_COORDS = {
  lagos: { lat: 6.5244, lon: 3.3792 },
  abuja: { lat: 9.0765, lon: 7.3986 },
  ph: { lat: 4.8156, lon: 7.0498 },
};

function resolveNearestBranchId(branches, position) {
  const { latitude, longitude } = position.coords;
  let bestId = branches[0].id;
  let bestScore = Number.POSITIVE_INFINITY;
  branches.forEach((b) => {
    const coords = BRANCH_COORDS[b.id];
    if (!coords) return;
    const score =
      Math.abs(coords.lat - latitude) + Math.abs(coords.lon - longitude);
    if (score < bestScore) {
      bestScore = score;
      bestId = b.id;
    }
  });
  return bestId;
}

export default function OrderPage() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [mode, setMode] = useState("dine-in");
  const [tableCode, setTableCode] = useState("");
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function load() {
      try {
        const [b, m] = await Promise.all([getBranches(), getMenu()]);
        setBranches(b);
        setBranchId(b[0]?.id || "");
        setMenu(m);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!lastOrder || !branchId) return;
    let t;
    async function poll() {
      try {
        const list = await getOrders(branchId);
        const found = list.find((o) => o.id === lastOrder.id);
        if (found) setLastOrder(found);
      } catch {}
    }
    t = setInterval(poll, 3000);
    return () => clearInterval(t);
  }, [lastOrder, branchId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!branches.length) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const bestId = resolveNearestBranchId(branches, position);
        if (bestId) setBranchId(bestId);
      },
      () => {},
      { timeout: 2500 },
    );
  }, [branches]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const tableParam = params.get("table");
    const branchParam = params.get("branch");
    if (modeParam) setMode(modeParam);
    if (tableParam) setTableCode(tableParam);
    if (branchParam) setBranchId(branchParam);
  }, []);

  function addToCart(id) {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }

  function removeFromCart(id) {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[id]) return next;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  const categories = [
    "All",
    ...Array.from(new Set(menu.map((m) => m.category))).filter(Boolean),
  ];

  const filteredMenu = menu
    .filter((item) =>
      activeCategory === "All" ? true : item.category === activeCategory,
    )
    .filter((item) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q)
      );
    });

  const cartItems = menu
    .filter((m) => cart[m.id])
    .map((m) => ({ ...m, qty: cart[m.id], lineTotal: cart[m.id] * m.price }));

  const cartTotal = cartItems.reduce((acc, it) => acc + it.lineTotal, 0);

  function getImageForItem(name, index) {
    const images = [
      "/assets/images/menu-jollof.jpg",
      "/assets/images/menu-egusi.jpg",
      "/assets/images/menu-fufu.jpg",
      "/assets/images/menu-chicken.jpg",
      "/assets/images/menu-plantain.jpg",
      "/assets/images/menu-assorted.jpg",
      "/assets/images/riceAndChicken.jpg",
    ];
    const idx = index % images.length;
    return images[idx];
  }

  async function handlePlaceOrder() {
    if (!branchId || cartItems.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        branchId,
        mode,
        tableCode: mode === "dine-in" ? tableCode || "TBL-001" : null,
        items: cartItems.map((it) => ({
          id: it.id,
          name: it.name,
          price: it.price,
          qty: it.qty,
        })),
        customerName: customerName || "Guest",
      };
      const order = await createOrder(payload);
      setLastOrder(order);
      setCurrentStep(2);
      setCart({});
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Ordering • The Promise Smart Dining Platform</title>
        <meta
          name="description"
          content="Customer ordering experience with branch selection, digital menu, payment summary, and real-time order status."
        />
      </Head>
      <header className="header">
        <div className="container topbar">
          <div className="brand">
            <div className="logo" />
            <div className="brand-title">The Promise</div>
          </div>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/order">Order</Link>
            <Link href="/kitchen">Kitchen</Link>
            <Link href="/admin">Head Office</Link>
          </nav>
          <div className="cta">
            <Link className="btn outline" href="/qr">
              QR Ordering
            </Link>
          </div>
        </div>
      </header>
      <main className="order-shell">
        <div className="order-container">
          <div className="order-board">
            <section className="order-main">
              <div className="order-main-top">
                <div className="order-search">
                  <input
                    className="order-search-input"
                    placeholder="Search dishes or categories"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="order-main-branch">
                  <span className="order-main-branch-label">Branch</span>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="order-main-branch-select"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="order-category-row">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={
                      "order-category-pill" +
                      (activeCategory === cat
                        ? " order-category-pill-active"
                        : "")
                    }
                    onClick={() => setActiveCategory(cat)}
                  >
                    <span className="order-category-name">{cat}</span>
                    {cat === "All" && (
                      <span className="order-category-count">
                        {menu.length} items
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="order-products-grid">
                {filteredMenu.map((item, index) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <article key={item.id} className="order-product-card">
                      <div className="order-product-image">
                        <img
                          src={getImageForItem(item.name, index)}
                          alt={item.name}
                          className="order-product-img"
                        />
                      </div>
                      <div className="order-product-body">
                        <div className="order-product-header">
                          <div>
                            <div className="order-product-name">
                              {item.name}
                            </div>
                            <div className="order-product-category">
                              {item.category}
                            </div>
                          </div>
                          <div className="order-product-price">
                            ₦{item.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="order-product-footer">
                          {qty === 0 ? (
                            <button
                              className="btn primary order-product-add"
                              onClick={() => addToCart(item.id)}
                            >
                              Add to Dish
                            </button>
                          ) : (
                            <div className="order-product-qty-row">
                              <button onClick={() => removeFromCart(item.id)}>
                                -
                              </button>
                              <span>{qty}</span>
                              <button onClick={() => addToCart(item.id)}>
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {filteredMenu.length === 0 && (
                  <div className="order-empty">
                    No dishes match your search or filters.
                  </div>
                )}
              </div>
            </section>

            <aside className="order-cart-column">
              <div className="order-cart-card">
                <div className="order-cart-top">
                  <div>
                    <div className="order-cart-label">Service Type</div>
                    <div className="order-mode-toggle">
                      <button
                        className={
                          "order-mode-pill" +
                          (mode === "dine-in" ? " order-mode-pill-active" : "")
                        }
                        onClick={() => setMode("dine-in")}
                      >
                        Dine In
                      </button>
                      <button
                        className={
                          "order-mode-pill" +
                          (mode === "takeaway" ? " order-mode-pill-active" : "")
                        }
                        onClick={() => setMode("takeaway")}
                      >
                        Take Away
                      </button>
                      <button
                        className={
                          "order-mode-pill" +
                          (mode === "delivery" ? " order-mode-pill-active" : "")
                        }
                        onClick={() => setMode("delivery")}
                      >
                        Delivery
                      </button>
                    </div>
                  </div>
                  <div className="order-cart-table">
                    <span className="order-cart-label">
                      {mode === "dine-in" ? "Table" : "Customer"}
                    </span>
                    {mode === "dine-in" ? (
                      <input
                        className="order-cart-input"
                        placeholder="Table code (e.g., TBL-A12)"
                        value={tableCode}
                        onChange={(e) => setTableCode(e.target.value)}
                      />
                    ) : (
                      <input
                        className="order-cart-input"
                        placeholder={
                          mode === "delivery"
                            ? "Customer name or delivery contact"
                            : "Customer name"
                        }
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="order-cart-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="order-cart-line">
                      <div>
                        <div className="order-cart-item-name">{item.name}</div>
                        <div className="order-cart-item-meta">
                          Qty {item.qty} • ₦{item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="order-cart-line-total">
                        ₦{item.lineTotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {cartItems.length === 0 && (
                    <div className="order-empty">No items in order yet.</div>
                  )}
                </div>

                <div className="order-cart-summary">
                  <div className="order-cart-summary-line">
                    <span>Subtotal</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="order-cart-summary-line">
                    <span>Service fee</span>
                    <span>₦0</span>
                  </div>
                  <div className="order-cart-summary-total">
                    <span>Total Amount</span>
                    <span>₦{cartTotal.toLocaleString()}</span>
                  </div>
                  <button
                    className="btn primary order-place-button"
                    disabled={submitting || cartItems.length === 0}
                    onClick={handlePlaceOrder}
                  >
                    {submitting ? "Placing order…" : "Place Order"}
                  </button>
                </div>
              </div>

              <div className="order-status-card">
                <h3>Order Status</h3>
                <div className="order-steps">
                  {steps.map((label, index) => (
                    <span
                      key={label}
                      className={
                        "step-pill" + (index === currentStep ? " active" : "")
                      }
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {lastOrder ? (
                  <>
                    <div className="tag" style={{ marginTop: 8 }}>
                      Order {lastOrder.orderNumber} for{" "}
                      <strong>{lastOrder.customerName}</strong>
                    </div>
                    <div className="status-strip">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={
                            "status-dot" +
                            (lastOrder.stepIndex >= i ? " active" : "")
                          }
                        />
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      Current status: <strong>{lastOrder.status}</strong>
                    </div>
                  </>
                ) : (
                  <div className="tag" style={{ marginTop: 8 }}>
                    Place an order to see the real-time status visualization.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          Customer Module • Dine-in and takeaway flows, smart menu, and secure
          payment summary.
        </div>
      </footer>
    </>
  );
}
