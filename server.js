const express = require("express");
const cors = require("cors");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const branches = [
  { id: "lagos", name: "Lagos Mainland", timezone: "Africa/Lagos" },
  { id: "abuja", name: "Abuja Central", timezone: "Africa/Lagos" },
  { id: "ph", name: "Port Harcourt", timezone: "Africa/Lagos" },
];

const menu = [
  { id: "jollof", name: "Jollof Rice", price: 3500, category: "Meals" },
  {
    id: "grilled-chicken",
    name: "Grilled Chicken",
    price: 4800,
    category: "Protein",
  },
  { id: "suya", name: "Suya Platter", price: 4200, category: "Meals" },
  { id: "salad", name: "Garden Salad", price: 2800, category: "Sides" },
  {
    id: "smoothie",
    name: "Tropical Smoothie",
    price: 1900,
    category: "Drinks",
  },
  {
    id: "waffles",
    name: "Buttermilk Waffles",
    price: 2600,
    category: "Dessert",
  },
];

let orders = [];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function uid() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateOrderNumber(branchId) {
  return `PROM-${todayStr()}-${branchId.toUpperCase()}-${uid()}`;
}

function aggregateAnalytics() {
  const byBranch = {};
  const hourly = {};
  const itemAgg = {};
  const customers = {};
  let dineIn = 0;
  let takeaway = 0;
  let basketTotal = 0;

  for (const o of orders) {
    byBranch[o.branchId] = (byBranch[o.branchId] || 0) + o.total;

    const hour = new Date(o.createdAt).getHours();
    hourly[hour] = (hourly[hour] || 0) + o.total;

    for (const it of o.items) {
      itemAgg[o.branchId] = itemAgg[o.branchId] || {};
      itemAgg[o.branchId][it.id] = (itemAgg[o.branchId][it.id] || 0) + it.qty;
    }

    customers[o.customerId] = (customers[o.customerId] || 0) + 1;

    if (o.mode === "dine-in") dineIn += 1;
    else takeaway += 1;
    basketTotal += o.total;
  }

  const bestByBranch = {};
  for (const [branchId, items] of Object.entries(itemAgg)) {
    let bestId = null;
    let bestQty = 0;
    for (const [itemId, qty] of Object.entries(items)) {
      if (qty > bestQty) {
        bestQty = qty;
        bestId = itemId;
      }
    }
    const menuItem = menu.find((m) => m.id === bestId);
    bestByBranch[branchId] = menuItem
      ? { id: menuItem.id, name: menuItem.name, qty: bestQty }
      : null;
  }

  const repeatCustomers = Object.values(customers).filter((v) => v > 1).length;
  const orderCount = orders.length || 1;

  return {
    branchTotals: byBranch,
    hourlyRevenue: hourly,
    bestSellers: bestByBranch,
    behavior: {
      dineIn,
      takeaway,
      avgBasket: basketTotal / orderCount,
      repeatCustomers,
    },
  };
}

function simulateProgress(orderId) {
  const steps = ["Received", "In Kitchen", "Ready", "Served"];
  let index = 0;

  const interval = setInterval(() => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      clearInterval(interval);
      return;
    }
    index = Math.min(index + 1, steps.length - 1);
    order.status = steps[index];
    order.stepIndex = index;
    if (index === steps.length - 1) {
      clearInterval(interval);
    }
  }, 4000);
}

app.prepare().then(() => {
  const server = express();
  server.use(cors());
  server.use(express.json());

  server.get("/api/branches", (req, res) => {
    res.json(branches);
  });

  server.get("/api/menu", (req, res) => {
    res.json(menu);
  });

  server.get("/api/orders", (req, res) => {
    const { branchId } = req.query;
    const filtered = branchId
      ? orders.filter((o) => o.branchId === branchId)
      : orders;
    res.json(filtered);
  });

  server.post("/api/orders", (req, res) => {
    const { branchId, mode, tableCode, items, customerName } = req.body;
    if (!branchId || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Invalid order payload" });
      return;
    }
    const total = items.reduce((acc, it) => acc + it.price * it.qty, 0);
    const order = {
      id: uid(),
      orderNumber: generateOrderNumber(branchId),
      branchId,
      mode: mode || "dine-in",
      tableCode: tableCode || null,
      items,
      total,
      totalFormatted: formatCurrency(total),
      status: "Received",
      stepIndex: 0,
      customerName: customerName || "Guest",
      customerId: customerName || "guest",
      paymentStatus: "Paid",
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    simulateProgress(order.id);
    res.status(201).json(order);
  });

  server.patch("/api/orders/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = orders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    order.status = status || order.status;
    res.json(order);
  });

  server.get("/api/analytics/overview", (req, res) => {
    res.json(aggregateAnalytics());
  });

  server.post("/api/chat", (req, res) => {
    const { role, message, branchId, page } = req.body || {};
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const trimmed = message.toLowerCase();
    let reply;
    if (trimmed.includes("menu") || trimmed.includes("food")) {
      reply =
        "Here is a quick view of today’s menu highlights: Jollof Rice, Grilled Chicken, Suya Platter, Garden Salad, Tropical Smoothie and Buttermilk Waffles. You can tap items in the menu panel to add them to your order.";
    } else if (trimmed.includes("open") || trimmed.includes("time")) {
      reply =
        "Branches typically operate from 11:00 to 23:00. For exact hours, please confirm with the specific branch; this demo focuses on the digital ordering and analytics experience.";
    } else if (trimmed.includes("order") && trimmed.includes("status")) {
      reply =
        "You can see live order status in the Ordering page under “Real-Time Order Status”, and in the Kitchen dashboard where staff advance orders from Received to Served.";
    } else if (trimmed.includes("analytics") || trimmed.includes("report")) {
      reply =
        "The Head Office dashboard compares branch revenue, visualizes peak hours, tracks best-selling items per branch and summarises customer behaviour such as dine-in vs takeaway and repeat customers.";
    } else if (role === "staff") {
      reply =
        "As branch staff you can use the Kitchen dashboard to view incoming orders, update their status and monitor daily performance metrics for your location.";
    } else if (role === "admin") {
      reply =
        "As head-office, use the analytics dashboard to compare branches, monitor hourly performance and understand product and customer trends across your restaurant estate.";
    } else {
      reply =
        "I can help you navigate The Promise platform. You can ask about placing an order, viewing your order status, understanding how branches are compared, or what analytics are available.";
    }
    const response = {
      reply,
      role: "assistant",
      branchId: branchId || null,
      page: page || null,
    };
    res.json(response);
  });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
