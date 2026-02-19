import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { getOverviewAnalytics, getBranches } from "@/lib/api";

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [a, b] = await Promise.all([
          getOverviewAnalytics(),
          getBranches()
        ]);
        setAnalytics(a);
        setBranches(b);
      } catch (e) {
        console.error(e);
      }
    }
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const branchTotals = analytics?.branchTotals || {};
  const hourly = analytics?.hourlyRevenue || {};
  const best = analytics?.bestSellers || {};
  const behavior = analytics?.behavior || {};

  const maxHourly = Math.max(1, ...Object.values(hourly));

  return (
    <>
      <Head>
        <title>Head Office Dashboard • The Promise Smart Dining Platform</title>
        <meta
          name="description"
          content="Central analytics workspace for multi-branch performance, revenue charts, peak hours, best sellers, and customer behavior."
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
          <section className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Branches</div>
              <div className="kpi-value">{branches.length}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Revenue (All Branches)</div>
              <div className="kpi-value">
                ₦
                {Object.values(branchTotals)
                  .reduce((a, v) => a + v, 0)
                  .toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Dine-in vs Takeaway</div>
              <div className="kpi-value">
                {behavior.dineIn || 0} dine-in • {behavior.takeaway || 0} takeaway
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Avg Basket Size</div>
              <div className="kpi-value">
                ₦{(behavior.avgBasket || 0).toFixed(0)}
              </div>
            </div>
          </section>

          <section className="split">
            <div className="card">
              <h3>Multi-Branch Performance</h3>
              <div className="tag">
                Compare revenue by branch to understand relative performance.
              </div>
              <div className="chart" style={{ marginTop: 10 }}>
                {branches.map(b => {
                  const value = branchTotals[b.id] || 0;
                  const max = Math.max(
                    1,
                    ...Object.values(branchTotals),
                    value
                  );
                  const height = (value / max) * 100 || 5;
                  return (
                    <div
                      key={b.id}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      <div
                        className="chart-bar"
                        style={{ height: `${height}%` }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--subtext)",
                          textAlign: "center"
                        }}
                      >
                        {b.name.split(" ")[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card">
              <h3>Peak Hour Heatmap</h3>
              <div className="tag">
                Visualizes hourly revenue intensity across the current day.
              </div>
              <div className="heatmap" style={{ marginTop: 10 }}>
                {Array.from({ length: 12 }).map((_, idx) => {
                  const hour = idx + 11;
                  const value = hourly[hour] || 0;
                  const level =
                    value === 0
                      ? 0
                      : value / maxHourly > 0.66
                      ? 3
                      : value / maxHourly > 0.33
                      ? 2
                      : 1;
                  const label = hour.toString().padStart(2, "0") + ":00";
                  return (
                    <div
                      key={hour}
                      className={
                        "heat-cell" +
                        (level ? ` level-${level}` : "")
                      }
                      title={label}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <section className="split">
            <div className="card">
              <h3>Best-Selling Items per Branch</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Item</th>
                    <th>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {branches.map(b => {
                    const row = best[b.id];
                    return (
                      <tr key={b.id}>
                        <td>{b.name}</td>
                        <td>{row?.name || "No data yet"}</td>
                        <td>{row?.qty || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card">
              <h3>Customer Behavior Metrics</h3>
              <div className="tag">
                High-level view of how guests interact with your estate.
              </div>
              <div className="kpi-grid" style={{ marginTop: 8 }}>
                <div className="kpi-card">
                  <div className="kpi-label">Dine-in Sessions</div>
                  <div className="kpi-value">{behavior.dineIn || 0}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Takeaway Sessions</div>
                  <div className="kpi-value">{behavior.takeaway || 0}</div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Repeat Customers</div>
                  <div className="kpi-value">
                    {behavior.repeatCustomers || 0}
                  </div>
                </div>
                <div className="kpi-card">
                  <div className="kpi-label">Typical Basket</div>
                  <div className="kpi-value">
                    ₦{(behavior.avgBasket || 0).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          Head Office • Centralized, investor-ready analytics on top of live
          restaurant operations.
        </div>
      </footer>
    </>
  );
}
