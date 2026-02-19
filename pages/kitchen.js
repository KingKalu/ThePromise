import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { getBranches, getOrders, updateOrderStatus } from "@/lib/api";

export default function KitchenPage() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadBranches() {
      try {
        const b = await getBranches();
        setBranches(b);
        const first = b[0]?.id || "";
        setBranchId(first);
      } catch (e) {
        console.error(e);
      }
    }
    loadBranches();
  }, []);

  useEffect(() => {
    let timer;
    async function poll() {
      if (!branchId) return;
      try {
        const data = await getOrders(branchId);
        setOrders(data);
      } catch (e) {
        console.error(e);
      }
    }
    poll();
    timer = setInterval(poll, 3000);
    return () => clearInterval(timer);
  }, [branchId]);

  async function advance(o) {
    const map = ["Received", "In Kitchen", "Ready", "Served"];
    const nextIndex = Math.min((o.stepIndex || 0) + 1, map.length - 1);
    const nextStatus = map[nextIndex];
    try {
      await updateOrderStatus(o.id, nextStatus);
      const data = await getOrders(branchId);
      setOrders(data);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <Head>
        <title>Kitchen Dashboard • The Promise Smart Dining Platform</title>
        <meta
          name="description"
          content="Branch operations interface for live incoming orders, preparation tracking, and staff management."
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
        </div>
      </header>
      <main className="section">
        <div className="container stack">
          <div className="row">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="input"
              style={{ maxWidth: 220 }}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <span className="pill">Live incoming orders</span>
          </div>

          <div className="card">
            <h3>Orders</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Mode</th>
                  <th>Table</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customerName}</td>
                    <td>{o.mode}</td>
                    <td>{o.tableCode || "-"}</td>
                    <td>{o.totalFormatted}</td>
                    <td>
                      <span
                        className={
                          "status " + o.status.toLowerCase().replace(" ", "-")
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn" onClick={() => advance(o)}>
                        Advance
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="tag">
                      No orders yet. Place one from the customer module.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Daily Sales</h3>
            <div className="tag">
              Branch performance summary for today (demo)
            </div>
            <div className="kpi-grid" style={{ marginTop: 8 }}>
              <div className="kpi-card">
                <div className="kpi-label">Orders</div>
                <div className="kpi-value">{orders.length}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Served</div>
                <div className="kpi-value">
                  {orders.filter((o) => o.status === "Served").length}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">In Kitchen</div>
                <div className="kpi-value">
                  {orders.filter((o) => o.status === "In Kitchen").length}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Ready</div>
                <div className="kpi-value">
                  {orders.filter((o) => o.status === "Ready").length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          Branch Operations • Kitchen dashboards, staff actions, and daily
          views.
        </div>
      </footer>
    </>
  );
}
