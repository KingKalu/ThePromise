import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Button, MenuItem, TextField } from "@mui/material";
import AppShell from "@/components/layout/AppShell";
import { createOrder, getBranches, getMenu, getOrders } from "@/lib/api";

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
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!lastOrder || !branchId) return;
    let timer;
    async function poll() {
      try {
        const list = await getOrders(branchId);
        const found = list.find((o) => o.id === lastOrder.id);
        if (found) setLastOrder(found);
      } catch {
        return null;
      }
      return null;
    }
    poll();
    timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [lastOrder, branchId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!branches.length || !navigator.geolocation) return;
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
    ...Array.from(new Set(menu.map((item) => item.category))).filter(Boolean),
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
    .filter((item) => cart[item.id])
    .map((item) => ({
      ...item,
      qty: cart[item.id],
      lineTotal: cart[item.id] * item.price,
    }));

  const cartTotal = cartItems.reduce((acc, item) => acc + item.lineTotal, 0);

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
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
        })),
        customerName: customerName || "Guest",
      };
      const order = await createOrder(payload);
      setLastOrder(order);
      setCurrentStep(2);
      setCart({});
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Ordering | The Promise Smart Dining Platform</title>
        <meta
          name="description"
          content="Customer ordering experience with branch selection, digital menu, payment summary, and real-time order status."
        />
      </Head>
      <AppShell
        footerText="Customer module | Dine-in, takeaway, and delivery in one flow."
        headerActions={
          <Button component={Link} href="/qr" variant="outlined" size="small">
            QR Ordering
          </Button>
        }
      >
        <main className="order-shell">
          <div className="order-container">
            <div className="order-board">
              <section className="order-main">
                <div className="order-main-top">
                  <div className="order-main-field order-search">
                    <span className="order-main-field-label">Search</span>
                    <input
                      className="order-search-input"
                      placeholder="Search dishes or categories"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                  <div className="order-main-field order-main-branch">
                    <span className="order-main-field-label">Branch</span>
                    <TextField
                      size="small"
                      select
                      value={branchId}
                      onChange={(event) => setBranchId(event.target.value)}
                      className="order-main-branch-select"
                      sx={{ bgcolor: "background.paper" }}
                    >
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </TextField>
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
                              <div className="order-product-name">{item.name}</div>
                              <div className="order-product-category">
                                {item.category}
                              </div>
                            </div>
                            <div className="order-product-price">
                              NGN {item.price.toLocaleString()}
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
                          onChange={(event) => setTableCode(event.target.value)}
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
                          onChange={(event) => setCustomerName(event.target.value)}
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
                            Qty {item.qty} | NGN {item.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="order-cart-line-total">
                          NGN {item.lineTotal.toLocaleString()}
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
                      <span>NGN {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="order-cart-summary-line">
                      <span>Service fee</span>
                      <span>NGN 0</span>
                    </div>
                    <div className="order-cart-summary-total">
                      <span>Total Amount</span>
                      <span>NGN {cartTotal.toLocaleString()}</span>
                    </div>
                    <button
                      className="btn primary order-place-button"
                      disabled={submitting || cartItems.length === 0}
                      onClick={handlePlaceOrder}
                    >
                      {submitting ? "Placing order..." : "Place Order"}
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
                        {[0, 1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className={
                              "status-dot" +
                              (lastOrder.stepIndex >= index ? " active" : "")
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
      </AppShell>
    </>
  );
}
