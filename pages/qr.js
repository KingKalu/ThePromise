import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { getBranches } from "@/lib/api";

export default function QRPage() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [tableCode, setTableCode] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const b = await getBranches();
        setBranches(b);
        setBranchId(b[0]?.id || "");
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  function handleStart() {
    if (!branchId) return;
    const table = tableCode || "TBL-001";
    window.location.href = `/order?mode=dine-in&table=${encodeURIComponent(
      table
    )}&branch=${encodeURIComponent(branchId)}`;
  }

  return (
    <>
      <Head>
        <title>QR Table Ordering • The Promise Smart Dining Platform</title>
        <meta
          name="description"
          content="Simulated QR ordering flow connecting the guest’s table identity to the digital ordering experience."
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
        <div className="container split">
          <section className="card">
            <h3>QR Table Ordering Flow</h3>
            <div className="stack">
              <div className="tag">
                In production, guests scan a unique table QR code. This demo
                simulates the same flow.
              </div>
              <input
                className="input"
                placeholder="Enter table code from QR (e.g., TBL-A12)"
                value={tableCode}
                onChange={e => setTableCode(e.target.value)}
              />
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="input"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <button className="btn primary" onClick={handleStart}>
                Start Dine-In Order
              </button>
            </div>
          </section>
          <section className="card">
            <h3>Demo Journey</h3>
            <div className="order-steps">
              <span className="step-pill active">1. QR Scan</span>
              <span className="step-pill">2. Smart Menu</span>
              <span className="step-pill">3. Secure Payment</span>
              <span className="step-pill">4. Order Status</span>
            </div>
            <div className="tag" style={{ marginTop: 10 }}>
              The Promise binds device, table, and branch together, unlocking
              precise analytics and service orchestration for your operations
              teams.
            </div>
          </section>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          QR Ordering Demo • From physical table to digital operations in a
          single scan.
        </div>
      </footer>
    </>
  );
}
